import { LightningElement, track } from 'lwc';

export default class ProviderAppForm extends LightningElement {
    @track currentPage = 1;
    @track totalPages = 4;
    
    @track formData = {
        companyLegalName: '',
        companyNumber: '',
        abn: '',
        businessName: '',
        businessAddress: '',
        orgType: ''
    };

    @track keyPersonnel = [{
        id: this.generateUniqueId(),
        fullName: '',
        position: '',
        email: '',
        phone: ''
    }];

    @track validationErrors = {};

    get currentPageString() {
        return String(this.currentPage);
    }

    get isPage1() {
        return this.currentPage === 1;
    }

    get isPage2() {
        return this.currentPage === 2;
    }

    get isPreviousDisabled() {
        return this.currentPage === 1;
    }

    get isNextDisabled() {
        return this.currentPage === this.totalPages || !this.isCurrentPageValid;
    }

    get isSaveDisabled() {
        return !this.isAllValid;
    }

    get orgTypeOptions() {
        return [
            { label: 'For Profit', value: 'forProfit' },
            { label: 'Not-For-Profit - Religious', value: 'notForProfitReligious' },
            { label: 'Not-For-Profit - Community Based', value: 'notForProfitCommunity' },
            { label: 'Not-For-Profit - Charitable', value: 'notForProfitCharitable' }
        ];
    }

    generateUniqueId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    handleFieldChange(event) {
        const field = event.target.dataset.field;
        this.formData[field] = event.target.value;
        this.validateField(field, event.target.value);
    }

    handleKeyPersonnelChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.dataset.field;
        this.keyPersonnel[index][field] = event.target.value;
        this.keyPersonnel = [...this.keyPersonnel];
    }

    handleAddKeyPersonnel() {
        this.keyPersonnel.push({
            id: this.generateUniqueId(),
            fullName: '',
            position: '',
            email: '',
            phone: ''
        });
        this.keyPersonnel = [...this.keyPersonnel];
    }

    validateField(fieldName, value) {
        let isValid = true;
        let errorMessage = '';

        if (!value || value.trim() === '') {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (fieldName === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        } else if (fieldName === 'phone') {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(value.replace(/\D/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid 10-digit phone number';
            }
        }

        this.validationErrors[fieldName] = {
            isValid,
            message: errorMessage
        };

        return isValid;
    }

    validateCurrentPage() {
        let isValid = true;
        
        if (this.isPage1) {
            isValid = this.validatePage1();
        } else if (this.isPage2) {
            isValid = this.validatePage2();
        }
        
        return isValid;
    }

    validatePage1() {
        const requiredFields = ['companyLegalName', 'companyNumber', 'abn', 'businessAddress', 'orgType'];
        return requiredFields.every(field => this.validateField(field, this.formData[field]));
    }

    validatePage2() {
        return this.keyPersonnel.every(person => {
            return ['fullName', 'position', 'email', 'phone'].every(field => 
                this.validateField(field, person[field])
            );
        });
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.validateCurrentPage() && this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    handleSave() {
        if (this.validateCurrentPage()) {
            // Implement save logic here
            console.log('Form Data:', this.formData);
            console.log('Key Personnel:', this.keyPersonnel);
        }
    }
}
