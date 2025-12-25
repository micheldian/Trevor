import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service d'envoi SMS
 * V1: Mock (log uniquement)
 * V2: Intégration Twilio/AWS SNS
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Envoie un SMS avec le code OTP
   * @param phone - Numéro de téléphone au format +33XXXXXXXXX
   * @param code - Code OTP à 6 chiffres
   */
  async sendOtp(phone: string, code: string): Promise<void> {
    const message = `Votre code Trevor: ${code}. Valide 10 minutes.`;

    // V1: Mock - Log uniquement (DEV)
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(`[SMS MOCK] To: ${phone} | Code: ${code}`);
      this.logger.log(`[SMS MOCK] Message: ${message}`);
      return;
    }

    // V2: Production - Twilio
    try {
      // Uncomment when ready for production
      // const client = twilio(
      //   this.configService.get('TWILIO_ACCOUNT_SID'),
      //   this.configService.get('TWILIO_AUTH_TOKEN'),
      // );
      //
      // await client.messages.create({
      //   body: message,
      //   from: this.configService.get('TWILIO_PHONE_NUMBER'),
      //   to: phone,
      // });

      this.logger.log(`SMS sent to ${phone}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}`, error.stack);
      throw error;
    }
  }

  /**
   * Alternative: AWS SNS
   */
  async sendOtpViaSns(phone: string, code: string): Promise<void> {
    // const sns = new AWS.SNS({ region: 'eu-west-1' });
    // await sns.publish({
    //   Message: `Votre code Trevor: ${code}`,
    //   PhoneNumber: phone,
    // }).promise();
  }
}
