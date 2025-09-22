import { LightningElement, api } from 'lwc';
import validateABN from '@salesforce/apex/ABNLookupController.validateABN';
import sendSMSNotification from '@salesforce/apex/ABNLookupController.sendSMSNotification';

export default class AbnLookup extends LightningElement {
    @api recordId;
    @api abnNumber;
    @api isReadOnly = false;
    @api mobileNumber;

    isLoading = false;
    validationResult;
    errorMessage;
    showSuccessMessage = false;

    handleAbnChange(event) {
        this.abnNumber = event.target.value;
        this.validationResult = undefined;
        this.errorMessage = undefined;
        this.showSuccessMessage = false;
    }

    async handleValidateAbn() {
        if (!this.abnNumber) {
            this.errorMessage = 'Please enter an ABN number';
            return;
        }

        this.isLoading = true;
        this.errorMessage = undefined;

        try {
            this.validationResult = await validateABN({ abnNumber: this.abnNumber });
            if (this.validationResult.isValid) {
                this.showSuccessMessage = true;
                if (this.mobileNumber) {
                    await this.sendNotification();
                }
            } else {
                this.errorMessage = 'Invalid ABN number';
            }
        } catch (error) {
            this.errorMessage = error.body?.message || 'Error validating ABN';
            this.validationResult = undefined;
        } finally {
            this.isLoading = false;
        }
    }

    async sendNotification() {
        try {
            await sendSMSNotification({ 
                mobileNumber: this.mobileNumber,
                message: `ABN ${this.abnNumber} has been successfully validated.`
            });
        } catch (error) {
            console.error('SMS notification error:', error);
            // Don't show SMS errors to user as it's not critical to main functionality
        }
    }

    get buttonVariant() {
        return this.validationResult?.isValid ? 'success' : 'brand';
    }

    get buttonLabel() {
        return this.isLoading ? 'Validating...' : 'Validate ABN';
    }

    get abnInputClass() {
        if (!this.validationResult) return '';
        return this.validationResult.isValid ? 'valid-abn' : 'invalid-abn';
    }
}