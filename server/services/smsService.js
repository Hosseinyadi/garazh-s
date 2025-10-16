const axios = require('axios');

class SMSService {
    constructor() {
        this.apiToken = process.env.SMS_API_TOKEN || '';
        this.baseUrl = process.env.SMS_BASE_URL || 'https://api.payamak-panel.com/api/SendSMS/SendSMS';
        this.username = process.env.SMS_USERNAME || '';
        this.password = process.env.SMS_PASSWORD || '';
        this.from = process.env.SMS_FROM || '';

        // Provider selection: 'payamak' (default) or 'smsir'
        this.provider = (process.env.SMS_PROVIDER || 'payamak').toLowerCase();
        // Sandbox flag for providers that support it (e.g., sms.ir)
        this.sandbox = String(process.env.SMS_SANDBOX || '').toLowerCase() === 'true';
        // sms.ir specific
        this.smsIrApiKey = process.env.SMS_IR_API_KEY || this.apiToken || '';
        this.smsIrVerifyUrl = process.env.SMS_IR_VERIFY_URL || 'https://api.sms.ir/v1/send/verify';
        this.smsIrTemplateId = parseInt(process.env.SMS_IR_TEMPLATE_ID || '123456', 10);
    }

    // Generate 6-digit OTP code
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP via SMS
    async sendOTP(phoneNumber, otpCode) {
        try {
            // Clean phone number (remove +98, add 0 if needed)
            let cleanPhone = phoneNumber.replace(/^\+98/, '0');
            if (!cleanPhone.startsWith('0')) {
                cleanPhone = '0' + cleanPhone;
            }

            // sms.ir provider (Verify API with optional Sandbox)
            if (this.provider === 'smsir') {
                // sms.ir expects mobile as 9xxxxxxxxx (no leading 0)
                const mobileForSmsIr = cleanPhone.replace(/^0/, '');
                const payload = {
                    mobile: mobileForSmsIr,
                    templateId: this.smsIrTemplateId,
                    parameters: [
                        { name: 'Code', value: otpCode }
                    ]
                };

                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain',
                    'x-api-key': this.smsIrApiKey
                };

                const response = await axios.post(this.smsIrVerifyUrl, payload, { headers });

                // sms.ir success pattern: status === 1
                if (response?.data?.status === 1) {
                    return {
                        success: true,
                        messageId: response.data?.data?.messageId || null,
                        message: 'OTP sent successfully (sms.ir)'
                    };
                }

                // If sandbox enabled, still treat as success to simulate
                if (this.sandbox) {
                    return {
                        success: true,
                        messageId: 'sandbox-' + Date.now(),
                        message: 'OTP sent (sms.ir sandbox)'
                    };
                }

                return {
                    success: false,
                    message: response?.data?.message || 'Failed to send OTP (sms.ir)'
                };
            }

            // Default provider: payamak-panel
            const message = `کد تایید شما: ${otpCode}\n\nبیل فلو - بازارگاه ماشین آلات سنگین`;

            const response = await axios.post(this.baseUrl, {
                username: this.username,
                password: this.password,
                to: cleanPhone,
                from: this.from,
                text: message,
                isFlash: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiToken ? { 'Authorization': `Bearer ${this.apiToken}` } : {})
                }
            });

            return {
                success: true,
                messageId: response.data?.MessageId || null,
                message: 'OTP sent successfully'
            };

        } catch (error) {
            console.error('SMS sending error:', error.message);
            
            // For development/testing, return success even if SMS fails
            if (process.env.NODE_ENV === 'development') {
                console.log(`[DEV] OTP for ${phoneNumber}: ${otpCode}`);
                return {
                    success: true,
                    messageId: 'dev-' + Date.now(),
                    message: 'OTP sent (development mode)'
                };
            }

            return {
                success: false,
                error: error.message,
                message: 'Failed to send OTP'
            };
        }
    }

    // Verify OTP format
    isValidOTP(otp) {
        return /^\d{6}$/.test(otp);
    }

    // Clean phone number
    cleanPhoneNumber(phone) {
        return phone.replace(/[^\d+]/g, '');
    }
}

module.exports = new SMSService();
