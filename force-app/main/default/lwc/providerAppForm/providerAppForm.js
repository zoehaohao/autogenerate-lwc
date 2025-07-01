import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppForm extends LightningElement {
    @track activeSections = ['section1'];
    @track formData = {
        companyName: '',
        companyACN: '',
        businessName: '',
        businessAddress: '',
        experience: '',
        careType: ''
    };
    @track keyPersonnel = [
        { id: '1', fullName: '', position: '' }
    ];

    get careTypeOptions() {
        return [
            { label: 'Residential Care', value: 'residential' },
            { label: 'Home Care', value: 'home' },
            { label: 'Flexible Care', value: 'flexible' }
        ];
    }

    get isSubmitDisabled() {
        return !this.isFormValid();
    }

    handleSectionToggle(event) {
        this.activeSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData = { ...this.formData, [name]: value };
    }

    handlePersonnelChange(event) {
        const personnelId = event.target.name;
        const field = event.target.dataset.field;
        const value = event.target.value;

        this.keyPersonnel = this.keyPersonnel.map(person => {
            if (person.id === personnelId) {
                return { ...person, [field]: value };
            }
            return person;
        });
    }

    addKeyPersonnel() {
        const newId = (this.keyPersonnel.length + 1).toString();
        this.keyPersonnel = [
            ...this.keyPersonnel,
            { id: newId, fullName: '', position: '' }
        ];
    }

    isFormValid() {
        const allInputs = [...this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-radio-group')];
        return allInputs.reduce((valid, input) => {
            return valid && input.checkValidity();
        }, true);
    }

    handleSaveDraft() {
        // Implement save draft functionality
        this.showToast('Success', 'Draft saved successfully', 'success');
    }

    handleSubmit() {
        if (!this.isFormValid()) {
            this.showToast('Error', 'Please complete all required fields', 'error');
            return;
        }

        try {
            // Implement form submission logic here
            console.log('Form Data:', this.formData);
            console.log('Key Personnel:', this.keyPersonnel);
            this.showToast('Success', 'Application submitted successfully', 'success');
        } catch (error) {
            this.showToast('Error', 'An error occurred while submitting the form', 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}
