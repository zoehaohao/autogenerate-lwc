export default class FeedbackFormTest extends LightningElement {
    showModal = false;
    showSuccessToast = false;
    currentStep = 1;
    selectedRating = null;
    feedbackText = '';

    get isStepOne() {
        return this.currentStep === 1;
    }

    get isStepTwo() {
        return this.currentStep === 2;
    }

    get progressStyle() {
        return `width: ${this.currentStep === 1 ? '50' : '100'}%`;
    }

    get nextButtonLabel() {
        return this.currentStep === 1 ? 'Next' : 'Submit';
    }

    get isNextDisabled() {
        return this.currentStep === 1 && !this.selectedRating;
    }

    get characterCount() {
        return this.feedbackText.length;
    }

    get ratingOptions() {
        return [
            { value: '1', label: 'It was quite easy', buttonClass: this.getRatingButtonClass('1') },
            { value: '2', label: 'Easy', buttonClass: this.getRatingButtonClass('2') },
            { value: '3', label: 'Neutral', buttonClass: this.getRatingButtonClass('3') },
            { value: '4', label: 'Difficult', buttonClass: this.getRatingButtonClass('4') },
            { value: '5', label: 'It was a lot of effort', buttonClass: this.getRatingButtonClass('5') }
        ];
    }

    getRatingButtonClass(value) {
        let baseClass = 'slds-button slds-button_neutral slds-p-around_small rating-button';
        return this.selectedRating === value ? `${baseClass} selected` : baseClass;
    }

    openModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.resetForm();
    }

    closeToast() {
        this.showSuccessToast = false;
    }

    handleRatingSelect(event) {
        this.selectedRating = event.currentTarget.dataset.value;
    }

    handleFeedbackChange(event) {
        this.feedbackText = event.target.value;
    }

    handleNext() {
        if (this.currentStep === 1) {
            this.currentStep = 2;
        } else {
            this.submitFeedback();
        }
    }

    handleBack() {
        this.currentStep = 1;
    }

    submitFeedback() {
        // Here you would typically make an API call to submit the feedback
        this.showSuccessToast = true;
        this.closeModal();
    }

    resetForm() {
        this.currentStep = 1;
        this.selectedRating = null;
        this.feedbackText = '';
    }
}
