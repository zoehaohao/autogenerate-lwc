// fieldInventoryForm.js
import { LightningElement, track } from 'lwc';

export default class FieldInventoryForm extends LightningElement {
    @track formData = {
        otherEmployeeStaff: 0,
        otherEmployeeStaffCentrally: 0,
        totalLabourCostsInternal: 0,
        totalLabourCostsInternalCentrally: 0,
        labourCostAgency: 0,
        labourCostAgencyCentrally: 0,
        registeredNurses: 0,
        registeredNursesCentrally: 0,
        enrolledNurses: 0,
        enrolledNursesCentrally: 0,
        personalCareWorkers: 0,
        personalCareWorkersCentrally: 0,
        alliedHealth: 0,
        alliedHealthCentrally: 0,
        otherAgencyStaff: 0,
        otherAgencyStaffCentrally: 0,
        totalLabourCostsAgency: 0,
        totalLabourCostsAgencyCentrally: 0,
        subContractedServicesCost: 0,
        subContractedServicesCostCentrally: 0
    };

    sectionOptions = [
        { label: 'Employee Staff', value: 'employeeStaff' },
        { label: 'Agency Care Staff', value: 'agencyCareStaff' },
        { label: 'Sub-contracted Services', value: 'subContractedServices' }
    ];

    columnOptions = [
        { label: 'Total', value: 'total' },
        { label: 'Centrally Held', value: 'centrallyHeld' }
    ];

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        this.formData[field] = value;
    }

    handleViewAll() {
        this.template.querySelectorAll('.acme-table tbody tr').forEach(row => {
            row.classList.remove('slds-is-collapsed');
        });
    }

    handleExpandTable() {
        this.template.querySelectorAll('.acme-table tbody tr').forEach(row => {
            row.classList.toggle('slds-is-collapsed');
        });
    }

    handleJumpToSection(event) {
        const section = event.detail.value;
        const element = this.template.querySelector(`[data-section="${section}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    handleJumpToColumn(event) {
        const column = event.detail.value;
        const element = this.template.querySelector(`[data-column="${column}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}