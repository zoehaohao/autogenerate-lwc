import { LightningElement, track } from 'lwc';

export default class QfrFormTest extends LightningElement {
    @track openSections = ['aboutSection'];
    @track providerContactSections = [];
    @track isLoading = false;
    
    // Form data properties
    @track solvencyConcern = '';
    @track solvencyIssues = '';
    @track operationalLoss = '';
    
    // Business structure toggles
    @track inHouseDelivery = true;
    @track franchisee = true;
    @track franchisor = false;
    @track brokerage = false;
    @track subcontractor = false;
    @track selfEmploy = false;
    @track otherStructure = false;
    
    // Care services
    @track inHouseCareServices = ['Clinical care'];
    @track franchiseeCareServices = ['Personal care'];
    @track inHouseAdditionalInfo = 'Test';
    @track franchiseeAdditionalInfo = 'Test';
    
    // Workforce and file management
    @track workforceEngagement = 'Individual agreements';
    @track documentCategory = 'Other';
    @track documentType = 'Other';
    @track searchTerm = '';
    @track showArchived = false;
    
    // Options for form fields
    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];
    
    careServiceOptions = [
        { label: 'Clinical care', value: 'Clinical care' },
        { label: 'Personal care', value: 'Personal care' },
        { label: 'Allied health', value: 'Allied health' },
        { label: 'Diversional therapy', value: 'Diversional therapy' },
        { label: 'Lifestyle / recreation / activities officer', value: 'Lifestyle / recreation / activities officer' },
        { label: 'Other', value: 'Other' }
    ];
    
    workforceOptions = [
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreements', value: 'Enterprise agreements' },
        { label: 'Award rates', value: 'Award rates' },
        { label: 'Other', value: 'Other' }
    ];
    
    documentCategoryOptions = [
        { label: 'Other', value: 'Other' },
        { label: 'QFR', value: 'QFR' },
        { label: 'Financial', value: 'Financial' },
        { label: 'Compliance', value: 'Compliance' }
    ];
    
    documentTypeOptions = [
        { label: 'Other', value: 'Other' },
        { label: 'Submission', value: 'Submission' },
        { label: 'Report', value: 'Report' },
        { label: 'Declaration', value: 'Declaration' }
    ];
    
    // Document table data
    @track documentData = [
        {
            id: '1',
            title: 'QFRDeclaratio...',
            owner: 'Test2 Account...',
            category: 'Other',
            type: 'Other',
            created: '30 Sept 2024',
            size: '0.7MB',
            status: 'Available'
        },
        {
            id: '2',
            title: 'QFR_PRV-714...',
            owner: 'Test2 Account...',
            category: 'QFR',
            type: 'Submission',
            created: '30 Sept 2024',
            size: '33.2KB',
            status: 'Available'
        },
        {
            id: '3',
            title: 'QFRDeclaratio...',
            owner: 'Test2 Account...',
            category: 'Other',
            type: 'Other',
            created: '30 Sept 2024',
            size: '0.7MB',
            status: 'File scanning i...'
        }
    ];
    
    documentColumns = [
        { label: 'Title', fieldName: 'title', type: 'text', sortable: true },
        { label: 'Owner', fieldName: 'owner', type: 'text', sortable: true },
        { label: 'Category', fieldName: 'category', type: 'text', sortable: true },
        { label: 'Type', fieldName: 'type', type: 'text', sortable: true },
        { label: 'Created', fieldName: 'created', type: 'text', sortable: true },
        { label: 'Size', fieldName: 'size', type: 'text', sortable: true },
        { label: 'Status', fieldName: 'status', type: 'text', sortable: true },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'View', name: 'view' },
                    { label: 'Download', name: 'download' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];
    
    // Computed properties for toggle labels
    get inHouseDeliveryLabel() {
        return this.inHouseDelivery ? 'Yes' : 'No';
    }
    
    get franchiseeLabel() {
        return this.franchisee ? 'Yes' : 'No';
    }
    
    get franchisorLabel() {
        return this.franchisor ? 'Yes' : 'No';
    }
    
    get brokerageLabel() {
        return this.brokerage ? 'Yes' : 'No';
    }
    
    get subcontractorLabel() {
        return this.subcontractor ? 'Yes' : 'No';
    }
    
    get selfEmployLabel() {
        return this.selfEmploy ? 'Yes' : 'No';
    }
    
    get otherStructureLabel() {
        return this.otherStructure ? 'Yes' : 'No';
    }
    
    // Event handlers
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }
    
    handleProviderContactToggle(event) {
        this.providerContactSections = event.detail.openSections;
    }
    
    handleSolvencyConcernChange(event) {
        this.solvencyConcern = event.detail.value;
    }
    
    handleSolvencyIssuesChange(event) {
        this.solvencyIssues = event.detail.value;
    }
    
    handleOperationalLossChange(event) {
        this.operationalLoss = event.detail.value;
    }
    
    handleInHouseDeliveryChange(event) {
        this.inHouseDelivery = event.target.checked;
    }
    
    handleFranchiseeChange(event) {
        this.franchisee = event.target.checked;
    }
    
    handleFranchisorChange(event) {
        this.franchisor = event.target.checked;
    }
    
    handleBrokerageChange(event) {
        this.brokerage = event.target.checked;
    }
    
    handleSubcontractorChange(event) {
        this.subcontractor = event.target.checked;
    }
    
    handleSelfEmployChange(event) {
        this.selfEmploy = event.target.checked;
    }
    
    handleOtherStructureChange(event) {
        this.otherStructure = event.target.checked;
    }
    
    handleInHouseCareServicesChange(event) {
        this.inHouseCareServices = event.detail.value;
    }
    
    handleFranchiseeCareServicesChange(event) {
        this.franchiseeCareServices = event.detail.value;
    }
    
    handleInHouseAdditionalInfoChange(event) {
        this.inHouseAdditionalInfo = event.target.value;
    }
    
    handleFranchiseeAdditionalInfoChange(event) {
        this.franchiseeAdditionalInfo = event.target.value;
    }
    
    handleWorkforceEngagementChange(event) {
        this.workforceEngagement = event.detail.value;
    }
    
    handleDocumentCategoryChange(event) {
        this.documentCategory = event.detail.value;
    }
    
    handleDocumentTypeChange(event) {
        this.documentType = event.detail.value;
    }
    
    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.filterDocuments();
    }
    
    handleShowArchivedChange(event) {
        this.showArchived = event.target.checked;
        this.filterDocuments();
    }
    
    handleDocumentCellChange(event) {
        const draftValues = event.detail.draftValues;
        // Handle document table cell changes
        console.log('Document cell changed:', draftValues);
    }
    
    handleEditContact() {
        // Handle edit contact functionality
        console.log('Edit contact clicked');
    }
    
    handleFileUpload() {
        // Handle file upload functionality
        console.log('File upload clicked');
    }
    
    handleViewAll() {
        // Handle view all documents
        console.log('View all clicked');
    }
    
    handlePrevious() {
        // Handle previous button
        console.log('Previous clicked');
    }
    
    handleSubmit() {
        this.isLoading = true;
        
        try {
            // Validate form
            if (!this.validateForm()) {
                this.isLoading = false;
                return;
            }
            
            // Simulate form submission
            setTimeout(() => {
                this.isLoading = false;
                console.log('Form submitted successfully');
                // Show success message or redirect
            }, 2000);
            
        } catch (error) {
            this.isLoading = false;
            console.error('Error submitting form:', error);
        }
    }
    
    validateForm() {
        let isValid = true;
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea, lightning-radio-group, lightning-checkbox-group');
        
        inputs.forEach(input => {
            if (input.required && !input.value) {
                input.setCustomValidity('This field is required');
                input.reportValidity();
                isValid = false;
            } else {
                input.setCustomValidity('');
                input.reportValidity();
            }
        });
        
        return isValid;
    }
    
    filterDocuments() {
        // Filter documents based on search term and archived status
        // This would typically filter the documentData array
        console.log('Filtering documents with term:', this.searchTerm, 'Show archived:', this.showArchived);
    }
    
    connectedCallback() {
        // Initialize component
        console.log('QFR Form Test component loaded');
    }
}
