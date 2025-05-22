// businessStructureForm.js
import { LightningElement, track } from 'lwc';

export default class BusinessStructureForm extends LightningElement {
    @track inHouseDelivery = false;
    @track inHouseCareServices = [];
    @track inHouseAdditionalInfo = '';
    @track franchise = false;
    @track franchiseCareServices = [];
    @track franchiseAdditionalInfo = '';

    careServiceOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Respite Care', value: 'respite' },
        { label: 'Palliative Care', value: 'palliative' }
    ];

    handleInHouseChange(event) {
        this.inHouseDelivery = event.target.checked;
    }

    handleInHouseServicesChange(event) {
        this.inHouseCareServices = event.detail.value;
    }

    handleInHouseInfoChange(event) {
        this.inHouseAdditionalInfo = event.target.value;
    }

    handleFranchiseChange(event) {
        this.franchise = event.target.checked;
    }

    handleFranchiseServicesChange(event) {
        this.franchiseCareServices = event.detail.value;
    }

    handleFranchiseInfoChange(event) {
        this.franchiseAdditionalInfo = event.target.value;
    }
}