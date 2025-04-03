// companyOverview.js
import { LightningElement, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import COMPANY_OBJECT from '@salesforce/schema/Company__c';
import NAME_FIELD from '@salesforce/schema/Company__c.Name';
import INDUSTRY_FIELD from '@salesforce/schema/Company__c.Industry__c';
import FOUNDED_DATE_FIELD from '@salesforce/schema/Company__c.Founded_Date__c';
import REVENUE_FIELD from '@salesforce/schema/Company__c.Annual_Revenue__c';
import EMPLOYEE_COUNT_FIELD from '@salesforce/schema/Company__c.Employee_Count__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Company__c.Description__c';

export default class CompanyOverview extends LightningElement {
    @track companyName;
    @track industry;
    @track foundedDate;
    @track revenue;
    @track employeeCount;
    @track companyDescription;

    @wire(getRecord, { recordId: '001xxxxxxxxxxxxxxx', fields: [NAME_FIELD, INDUSTRY_FIELD, FOUNDED_DATE_FIELD, REVENUE_FIELD, EMPLOYEE_COUNT_FIELD, DESCRIPTION_FIELD] })
    wiredCompany({ error, data }) {
        if (data) {
            this.companyName = data.fields.Name.value;
            this.industry = data.fields.Industry__c.value;
            this.foundedDate = data.fields.Founded_Date__c.value;
            this.revenue = data.fields.Annual_Revenue__c.value;
            this.employeeCount = data.fields.Employee_Count__c.value;
            this.companyDescription = data.fields.Description__c.value;
        } else if (error) {
            this.showToast('Error', 'Error loading company data', 'error');
        }
    }

    handleExport() {
        // Implement export functionality
        this.showToast('Export', 'Data export initiated', 'success');
    }

    handleRefresh() {
        // Implement refresh functionality
        this.showToast('Refresh', 'Data refreshed', 'success');
    }

    handleViewDetails() {
        // Implement view details functionality
        this.showToast('View Details', 'Opening company details', 'info');
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}