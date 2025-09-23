import { LightningElement, track } from 'lwc';

export default class NzAccClaims extends LightningElement {
    @track claimNumber = '';
    @track incidentDate = '';
    @track claimStatus = '';
    @track description = '';

    get statusOptions() {
        return [
            { label: 'New', value: 'new' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Under Review', value: 'underReview' },
            { label: 'Approved', value: 'approved' },
            { label: 'Declined', value: 'declined' }
        ];
    }

    handleClaimNumberChange(event) {
        this.claimNumber = event.target.value;
    }

    handleIncidentDateChange(event) {
        this.incidentDate = event.target.value;
    }

    handleStatusChange(event) {
        this.claimStatus = event.target.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    handleSave() {
        // Frontend only - log the claim data
        const claimData = {
            claimNumber: this.claimNumber,
            incidentDate: this.incidentDate,
            status: this.claimStatus,
            description: this.description
        };
        console.log('Claim Data:', claimData);

        // Dispatch success event
        this.dispatchEvent(
            new CustomEvent('success', {
                detail: {
                    message: 'Claim data captured successfully'
                }
            })
        );
    }

    handleClear() {
        this.claimNumber = '';
        this.incidentDate = '';
        this.claimStatus = '';
        this.description = '';
    }
}