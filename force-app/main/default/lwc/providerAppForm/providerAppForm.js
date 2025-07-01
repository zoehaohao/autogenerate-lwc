import { LightningElement, track } from 'lwc';

export default class ProviderAppForm extends LightningElement {
    @track currentPage = 1;
    @track totalPages = 6;

    @track formData = {
        // Declaration Officers
        declaringOfficer1Name: '',
        declaringOfficer1Position: '',
        declaringOfficer1Date: '',
        declaringOfficer2Name: '',
        declaringOfficer2Position: '',
        declaringOfficer2Date: '',

        // Organization Details
        legalName: '',
        acn: '',
        abn: '',
        businessName: '',
    };

    @track selectedDocuments = [];

    get requiredDocuments() {
        return [
            { label: 'Certificate of Registration', value: 'registration' },
            { label: 'Trust Deed (if applicable)', value: 'trustDeed' },
            { label: 'Organization Chart', value: 'orgChart' },
            { label: 'Business Plan', value: 'businessPlan' },
            { label: 'ACNC Documents', value: 'acnc' },
            { label: 'National Police Certificates', value: 'policeCheck' },
            { label: 'Statutory Declarations', value: 'declarations' },
            { label: 'Insolvency Checks', value: 'insolvencyCheck' },
            { label: 'Financial Statements', value: 'financials' }
        ];
    }

    get currentPageString() {
        return String(this.currentPage);
    }

    get isPage1() {
        return this.currentPage === 1;
    }

    get isPage2() {
        return this.currentPage === 2;
    }

    get isPage3() {
        return this.currentPage === 3;
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

    get isCurrentPageValid() {
        switch(this.currentPage) {
            case 1:
                return this.selectedDocuments.length > 0;
            case 2:
                return this.validateDeclarationPage();
            case 3:
                return this.validateOrganizationPage();
            default:
                return true;
        }
    }

    handleDocumentSelection(event) {
        this.selectedDocuments = event.detail.value;
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.formData[field] = event.target.value;
    }

    validateDeclarationPage() {
        const requiredFields = [
            'declaringOfficer1Name',
            'declaringOfficer1Position',
            'declaringOfficer1Date',
            'declaringOfficer2Name',
            'declaringOfficer2Position',
            'declaringOfficer2Date'
        ];

        return requiredFields.every(field => 
            this.formData[field] && this.formData[field].trim() !== ''
        );
    }

    validateOrganizationPage() {
        const requiredFields = ['legalName', 'acn', 'abn'];
        return requiredFields.every(field => 
            this.formData[field] && this.formData[field].trim() !== ''
        );
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.isCurrentPageValid && this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    handleSave() {
        // Implement save functionality
        console.log('Form Data:', this.formData);
        console.log('Selected Documents:', this.selectedDocuments);
    }

    validateABN(abn) {
        return /^\d{11}$/.test(abn);
    }
}
