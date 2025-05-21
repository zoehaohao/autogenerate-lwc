// dateRangeValidator.js
import { LightningElement, api, track } from 'lwc';
export default class DateRangeValidator extends LightningElement {
    @api allowPastDates = false;
    @track startDate;
    @track endDate;
    @track startDateError;
    @track endDateError;
    get minStartDate() {
        return this.allowPastDates ? null : new Date().toISOString().split('T')[0];
    }
    get minEndDate() {
        return this.startDate || this.minStartDate;
    }
    get isSubmitDisabled() {
        return !this.startDate || !this.endDate || this.startDateError || this.endDateError;
    }
    get startDateClass() {
        return `acme-date-range-validator__input ${this.startDateError ? 'acme-date-range-validator__input_error' : ''}`;
    }
    get endDateClass() {
        return `acme-date-range-validator__input ${this.endDateError ? 'acme-date-range-validator__input_error' : ''}`;
    }
    handleStartDateChange(event) {
        this.startDate = event.target.value;
        this.validateStartDate();
        this.validateEndDate();
    }
    handleEndDateChange(event) {
        this.endDate = event.target.value;
        this.validateEndDate();
    }
    validateStartDate() {
        if (!this.startDate) {
            this.startDateError = 'Start Date is required';
        } else if (!this.allowPastDates && new Date(this.startDate) < new Date().setHours(0,0,0,0)) {
            this.startDateError = 'Start Date cannot be in the past';
        } else {
            this.startDateError = null;
        }
    }
    validateEndDate() {
        if (!this.endDate) {
            this.endDateError = 'End Date is required';
        } else if (this.startDate && new Date(this.endDate) < new Date(this.startDate)) {
            this.endDateError = 'End Date must be after Start Date';
        } else {
            this.endDateError = null;
        }
    }
    handleSubmit() {
        if (!this.isSubmitDisabled) {
            this.dispatchEvent(new CustomEvent('daterangevalid', {
                detail: { startDate: this.startDate, endDate: this.endDate }
            }));
        }
    }
    handleClear() {
        this.startDate = null;
        this.endDate = null;
        this.startDateError = null;
        this.endDateError = null;
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = null;
        });
    }
    @api
    validate() {
        this.validateStartDate();
        this.validateEndDate();
        return !this.startDateError && !this.endDateError;
    }
    @api
    reset() {
        this.handleClear();
    }
    @api
    getValidationState() {
        return {
            isValid: !this.startDateError && !this.endDateError,
            startDate: this.startDate,
            endDate: this.endDate,
            startDateError: this.startDateError,
            endDateError: this.endDateError
        };
    }
}