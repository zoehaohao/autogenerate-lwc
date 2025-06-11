// qfrMultiPageForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class QfrMultiPageForm extends LightningElement {
    @track currentPage = 1;
    @track formData = {};
    @track isNextDisabled = true;
    totalPages = 3;
    get isPage1() {
        return this.currentPage === 1;
    }
    get isPage2() {
        return this.currentPage === 2;
    }
    get isPage3() {
        return this.currentPage === 3;
    }
    get isFirstPage() {
        return this.currentPage === 1;
    }
    get isLastPage() {
        return this.currentPage === this.totalPages;
    }
    get nextButtonLabel() {
        return this.isLastPage ? 'Submit' : 'Next';
    }
    handleDataUpdate(event) {
        this.formData = { ...this.formData, ...event.detail };
        this.autoSave();
    }
    handleValidation(event) {
        this.isNextDisabled = !event.detail.isValid;
    }
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }
    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        } else {
            this.submitForm();
        }
    }
    autoSave() {
        const autoSaveEvent = new CustomEvent('autosave', { detail: this.formData });
        this.dispatchEvent(autoSaveEvent);
    }
    submitForm() {
        const submitEvent = new CustomEvent('submit', { detail: this.formData });
        this.dispatchEvent(submitEvent);
        this.showToast('Success', 'Form submitted successfully', 'success');
    }
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}