import { LightningElement, track } from 'lwc';

export default class FeedbackFormTest extends LightningElement {
    @track showFeedbackModal = false;
    @track showSuccessToast = false;
    @track currentStep = 0;
    @track selectedRating = null;
    @track feedbackText = '';
    @track characterCount = 0;

    ratingOptions = [
        { value: 1, label: 'It was quite easy', buttonClass: 'rating-button rating-green' },
        { value: 2, label: 'Easy', buttonClass: 'rating-button rating-light-green' },
        { value: 3, label: 'Neutral', buttonClass: 'rating-button rating-neutral' },
        { value: 4, label: 'Difficult', buttonClass: 'rating-button rating-light-red' },
        { value: 5, label: 'It was a lot of effort', buttonClass: 'rating-button rating-red' }
    ];

    get isStepOne() {
        return this.currentStep === 50;
    }

    get isStepTwo() {
        return this.currentStep === 100;
    }

    get isNextDisabled() {
        return this.selectedRating === null;
    }

    get progressStyle() {
        return `width: ${this.currentStep}%`;
    }

    openFeedbackModal() {
        this.showFeedbackModal = true;
        this.currentStep = 50;
        this.selectedRating = null;
        this.feedbackText = '';
    }

    closeFeedbackModal() {
        this.showFeedbackModal = false;
        this.resetForm();
    }

    handleRatingSelect(event) {
        const value = parseInt(event.currentTarget.dataset.value);
        this.selectedRating = value;
        
        // Update button classes
        this.ratingOptions = this.ratingOptions.map(option => ({
            ...option,
            buttonClass: `rating-button ${option.value === value ? 'selected' : ''} rating-${this.getRatingColor(option.value)}`
        }));
    }

    getRatingColor(value) {
        const colors = ['green', 'light-green', 'neutral', 'light-red', 'red'];
        return colors[value - 1];
    }

    handleNext() {
        if (this.selectedRating) {
            this.currentStep = 100;
        }
    }

    handleBack() {
        this.currentStep = 50;
    }

    handleTextareaChange(event) {
        this.feedbackText = event.target.value;
        this.characterCount = this.feedbackText.length;
    }

    handleSubmit() {
        // Here you would typically make an API call to save the feedback
        this.showSuccessToast = true;
        this.showFeedbackModal = false;
        this.resetForm();
        
        // Auto-hide toast after 5 seconds
        setTimeout(() => {
            this.showSuccessToast = false;
        }, 5000);
    }

    closeToast() {
        this.showSuccessToast = false;
    }

    resetForm() {
        this.currentStep = 50;
        this.selectedRating = null;
        this.feedbackText = '';
        this.characterCount = 0;
    }
}
