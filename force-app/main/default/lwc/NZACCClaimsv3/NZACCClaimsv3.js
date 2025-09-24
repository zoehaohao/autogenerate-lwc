import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import submitClaim from '@salesforce/apex/NZACCClaimsv3Controller.submitClaim';

export default class NZACCClaimsv3 extends LightningElement {
    @api recordId;
    
    @track claimNumber = '';
    @track claimDate = '';
    @track claimType = '';
    @track description = '';
    @track amount = '';

    get claimTypeOptions() {
        return [
            { label: 'Work Injury', value: 'Work_Injury' },
            { label: 'Vehicle Accident', value: 'Vehicle_Accident' },
            { label: 'Medical Treatment', value: 'Medical_Treatment' },
            { label: 'Other', value: 'Other' }
        ];
    }

    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        this[field] = value;
    }

    handleSubmit() {
        if (this.validateFields()) {
            const claimData = {
                claimNumber: this.claimNumber,
                claimDate: this.claimDate,
                claimType: this.claimType,
                description: this.description,
                amount: parseFloat(this.amount)
            };

            submitClaim({ claimData: claimData })
                .then(result => {
                    this.showToast('Success', 'Claim submitted successfully', 'success');
                    this.handleClear();
                })
                .catch(error => {
                    this.showToast('Error', 'Error submitting claim: ' + error.body.message, 'error');
                });
        }
    }

    handleClear() {
        this.claimNumber = '';
        this.claimDate = '';
        this.claimType = '';
        this.description = '';
        this.amount = '';
    }

    validateFields() {
        const inputFields = this.template.querySelectorAll('lightning-input, lightning-combobox');
        let isValid = true;

        inputFields.forEach(field => {
            if (field.required && !field.value) {
                field.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}