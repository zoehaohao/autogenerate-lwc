import { LightningElement, track } from 'lwc';

export default class FeedbackFormTest extends LightningElement {
    @track currentStep = 1;
    @track selectedRating = null;
    @track feedbackDetails = '';
    @track showSuccessToast = false;

    get isStepOne() {
        return this.currentStep === 1;
    }

    get isStepTwo() {
        return this.currentStep === 2;
    }

    get progressPercentage() {
        return this.currentStep === 1 ? 50 : 100;
    }

    get progressStyle() {
        return `width: ${this.progressPercentage}%`;
    }

    get characterCount() {
        return this.feedbackDetails.length;
    }

    get isNextDisabled() {
        return !this.selectedRating;
    }

    get ratingOptions() {
        return [
            { label: '1\nIt was quite easy', value: 1, variant: this.selectedRating === 1 ? 'brand' : 'neutral' },
            { label: '2\nEasy', value: 2, variant: this.selectedRating === 2 ? 'brand' : 'neutral' },
            { label: '3\nNeutral', value: 3, variant: this.selectedRating === 3 ? 'brand' : 'neutral' },
            { label: '4\nDifficult', value: 4, variant: this.selectedRating === 4 ? 'brand' : 'neutral' },
            { label: '5\nIt was a lot of effort', value: 5, variant: this.selectedRating === 5 ? 'brand' : 'neutral' }
        ];
    }

    handleRating(rating) {
        this.selectedRating = rating;
    }

    handleNext() {
        if (this.selectedRating) {
            this.currentStep = 2;
        }
    }

    handleBack() {
        this.currentStep = 1;
    }

    handleFeedbackChange(event) {
        this.feedbackDetails = event.target.value;
    }

    handleSubmit() {
        // Here you would typically make an API call to save the feedback
        this.showSuccessToast = true;
        this.resetForm();
    }

    closeToast() {
        this.showSuccessToast = false;
    }

    resetForm() {
        this.currentStep = 1;
        this.selectedRating = null;
        this.feedbackDetails = '';
    }
}
