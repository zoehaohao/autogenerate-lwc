import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppForm extends LightningElement {
    @track openSections = ['section1'];
    @track showSpinner = false;
    @track isSubmitDisabled = true;
    
    @track applicantDetails = {
        legalName: '',
        acn: '',
        businessName: '',
        abn: ''
    };
    
    @track keyPersonnelData = [];
    
    keyPersonnelColumns = [
        { label: 'Name', fieldName: 'name', type: 'text' },
        { label: 'Position', fieldName: 'position', type: 'text' },
        { label: 'Email', fieldName: 'email', type: 'email' },
        { label: 'Phone', fieldName: 'phone', type: 'phone' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];
    
    handleSectionToggle(event) {
        this.openSections = event.detail.openSections;
    }
    
    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.applicantDetails[field] = event.target.value;
        this.validateForm();
    }
    
    handleAddKeyPersonnel() {
        const newPerson = {
            id: Date.now().toString(),
            name: '',
            position: '',
            email: '',
            phone: ''
        };
        this.keyPersonnelData = [...this.keyPersonnelData, newPerson];
        this.validateForm();
    }
    
    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        
        switch (action.name) {
            case 'edit':
                this.editKeyPersonnel(row);
                break;
            case 'delete':
                this.deleteKeyPersonnel(row);
                break;
            default:
                break;
        }
    }
    
    editKeyPersonnel(row) {
        // Implementation for editing key personnel
        console.log('Editing:', row);
    }
    
    deleteKeyPersonnel(row) {
        this.keyPersonnelData = this.keyPersonnelData.filter(item => item.id !== row.id);
        this.validateForm();
    }
    
    validateForm() {
        const { legalName, acn, abn } = this.applicantDetails;
        this.isSubmitDisabled = !(legalName && acn && abn && this.keyPersonnelData.length > 0);
    }
    
    handleSubmit() {
        this.showSpinner = true;
        
        // Simulate API call
        setTimeout(() => {
            this.showSpinner = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Application submitted successfully',
                    variant: 'success'
                })
            );
        }, 2000);
    }
}
