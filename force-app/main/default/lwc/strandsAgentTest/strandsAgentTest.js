import { LightningElement, api, track } from 'lwc';

export default class StrandsAgentTest extends LightningElement {
    @track isAboutSectionExpanded = false;
    
    // Sample data - in real implementation these would be @api properties or loaded from backend
    providerName = 'Account AP Test1 30 SepNot for Profit Provider';
    napsId = 'PRV-71431173';
    contactName = 'Mr test name sep name';
    contactRole = 'Manager';
    contactPhone = '0456456654';
    contactEmail = 'test30sep@health.gov.au';

    get aboutSectionIcon() {
        return this.isAboutSectionExpanded ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get aboutSectionClass() {
        return `slds-accordion__content ${this.isAboutSectionExpanded ? 'slds-show' : 'slds-hide'}`;
    }

    toggleAboutSection() {
        this.isAboutSectionExpanded = !this.isAboutSectionExpanded;
    }

    handleEdit() {
        // Implement edit functionality
        // This would typically open a modal or navigate to edit view
        this.dispatchEvent(new CustomEvent('edit', {
            detail: {
                contactId: this.contactId,
                currentData: {
                    name: this.contactName,
                    role: this.contactRole,
                    phone: this.contactPhone,
                    email: this.contactEmail
                }
            }
        }));
    }
}