// formWithTooltips.js
import { LightningElement, track } from 'lwc';

export default class FormWithTooltips extends LightningElement {
    @track businessStructureOptions = [
        { label: 'In-house delivery', value: 'inhouseDelivery' },
        { label: 'Franchisee', value: 'franchisee' },
        { label: 'Franchisor', value: 'franchisor' },
        { label: 'Subcontractor', value: 'subcontractor' },
        { label: 'Self-employed individual', value: 'selfEmployed' },
        { label: 'Other - please specify', value: 'other' }
    ];

    @track inhouseDeliveryServicesOptions =[
        { label: 'Clinical care', value: 'clinicalCare' },
        { label: 'Personal care', value: 'personalCare' },
        { label: 'Allied health', value: 'alliedHealth' },
        { label: 'Diversional therapy', value: 'diversionalTherapy' },
        { label: 'Lifestyle / recreation / activities officer', value: 'lifestyleRecreation' },
        { label: 'Other', value: 'other' }
    ];

    @track franchiseeServicesOptions = [
        { label: 'Clinical care', value: 'clinicalCare' },
        { label: 'Personal care', value: 'personalCare' },
        { label: 'Allied health', value: 'alliedHealth' },
        { label: 'Diversional therapy', value: 'diversionalTherapy' },
        { label: 'Lifestyle / recreation / activities officer', value: 'lifestyleRecreation' },
        { label: 'Other', value: 'other' }
    ];

    @track otherBusinessStructures = [
        { label: 'Does your organisation use "Franchisor" as its business structure?', value: 'franchisor' },
        { label: 'Does your organisation use "Subcontractor" as its business structure?', value: 'subcontractor' },
        { label: 'Does your organisation use "Self-employed individual" as its business structure?', value: 'selfEmployed' },
        { label: 'Does your organisation use "Other - please specify" as its business structure?', value: 'other' }
    ];

    @track showInhouseDelivery = true;
    @track inhouseDeliverySelected = false;
    @track selectedInhouseDeliveryServices = [];
    @track inhouseDeliveryAdditionalInfo = '';

    @track showFranchisee = true;
    @track franchiseeSelected = false;
    @track selectedFranchiseeServices = [];
    @track franchiseeAdditionalInfo = '';

    @track directCareWorkforce = 'Individual agreements';
    @track directCareWorkforceOptions = [
        { label: 'Individual agreements', value: 'individualAgreements' },
        { label: 'Enterprise agreements', value: 'enterpriseAgreements' },
        { label: 'Other', value: 'other' }
    ];

    @track adminWorkforce = 'Enterprise agreements';
    @track adminWorkforceOptions = [
        { label: 'Individual agreements', value: 'individualAgreements' },
        { label: 'Enterprise agreements', value: 'enterpriseAgreements' },
        { label: 'Other', value: 'other' }
    ];

    @track wageIncreaseAttestation = false;

    handleInhouseDeliveryChange(event) {
        this.inhouseDeliverySelected = event.target.checked;
    }

    handleInhouseDeliveryServicesChange(event) {
        this.selectedInhouseDeliveryServices = event.detail.value;
    }

    handleInhouseDeliveryAdditionalInfoChange(event) {
        this.inhouseDeliveryAdditionalInfo = event.target.value;
    }

    handleFranchiseeChange(event) {
        this.franchiseeSelected = event.target.checked;
    }

    handleFranchiseeServicesChange(event) {
        this.selectedFranchiseeServices = event.detail.value;
    }

    handleFranchiseeAdditionalInfoChange(event) {
        this.franchiseeAdditionalInfo = event.target.value;
    }

    handleOtherBusinessStructureChange(event) {
        // Implement logic to handle selection/deselection of other business structures
    }

    handleDirectCareWorkforceChange(event) {
        this.directCareWorkforce = event.detail.value;
    }

    handleAdminWorkforceChange(event) {
        this.adminWorkforce = event.detail.value;
    }

    handleWageIncreaseAttestation(event) {
        this.wageIncreaseAttestation = event.target.checked;
    }

    handlePrevious() {
        // Implement logic to navigate to the previous section
    }

    handleNext() {
        // Implement logic to navigate to the next section
    }
}
