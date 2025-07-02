import { LightningElement, track } from 'lwc';

export default class FeedbackFormTest extends LightningElement {
    @track currentStep = '1';
    @track selectedRating = null;
    @track feedbackDetails = '';
    @track showSuccessToast = false;

    ratingOptions = [
        { value: '1', label: 'It was quite easy', buttonClass: 'rating-button slds-theme_success' },
        { value: '2', label: 'Easy', buttonClass: 'rating-button slds-theme_success' },
        { value: '3', label: 'Neutral', buttonClass: 'rating-button' },
        { value: '4', label: 'Difficult', buttonClass: 'rating-button slds-theme_error' },
        { value: '5', label: 'It was a lot of effort', buttonClass: 'rating-button slds-theme_error' }
    ];

    get isStepOne() {
        return this.currentStep === '1';
    }

    get isStepTwo() {
        return this.currentStep === '2';
    }

    get showBackButton() {
        return this.currentStep === '2';
    }

    get nextButtonLabel() {
        return this.currentStep === '2' ? 'Submit' : 'Next';
    }

    get isNextDisabled() {
        return this.currentStep === '1' && !this.selectedRating;
    }

    get characterCount() {
        return this.feedbackDetails.length;
    }

    handleRatingSelect(event) {
        this.selectedRating = event.currentTarget.dataset.value;
        const buttons = this.template.querySelectorAll('.rating-button');
        buttons.forEach(button => {
            button.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
    }

    handleDetailsChange(event) {
        this.feedbackDetails = event.target.value;
    }

    handleNext() {
        if (this.currentStep === '1') {
            this.currentStep = '2';
        } else {
            this.submitFeedback();
        }
    }

    handleBack() {
        this.currentStep = '1';
    }

    submitFeedback() {
        // Here you would typically make an API call to save the feedback
        console.log('Feedback submitted:', {
            rating: this.selectedRating,
            details: this.feedbackDetails
        });
        
        this.showSuccessToast = true;
        this.resetForm();
    }

    resetForm() {
        this.currentStep = '1';
        this.selectedRating = null;
        this.feedbackDetails = '';
        const buttons = this.template.querySelectorAll('.rating-button');
        buttons.forEach(button => {
            button.classList.remove('selected');
        });
    }

    closeToast() {
        this.showSuccessToast = false;
    }
}
