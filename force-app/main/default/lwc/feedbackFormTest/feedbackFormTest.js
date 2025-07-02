import { LightningElement, track } from 'lwc';

export default class FeedbackFormTest extends LightningElement {
    @track currentStep = '1';
    @track selectedRating = null;
    @track feedbackComment = '';
    @track showSuccessToast = false;

    get isStepOne() {
        return this.currentStep === '1';
    }

    get isStepTwo() {
        return this.currentStep === '2';
    }

    get showBackButton() {
        return this.currentStep === '2';
    }

    get isNextDisabled() {
        return !this.selectedRating;
    }

    get characterCount() {
        return this.feedbackComment.length;
    }

    get getRatingClass() {
        return (rating) => {
            return `rating-box ${this.selectedRating === rating ? 'selected' : ''}`;
        };
    }

    handleRating(event) {
        this.selectedRating = event.currentTarget.dataset.rating;
    }

    handleCommentChange(event) {
        this.feedbackComment = event.target.value;
    }

    handleNext() {
        if (this.selectedRating) {
            this.currentStep = '2';
        }
    }

    handleBack() {
        this.currentStep = '1';
    }

    handleSubmit() {
        // Here you would typically make an API call to save the feedback
        // For demo purposes, we'll just show the success toast
        this.showSuccessToast = true;
        this.resetForm();
    }

    closeToast() {
        this.showSuccessToast = false;
    }

    resetForm() {
        this.currentStep = '1';
        this.selectedRating = null;
        this.feedbackComment = '';
    }
}
