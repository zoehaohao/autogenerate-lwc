// providerContactDetails.js
import { LightningElement, api } from 'lwc';

export default class ProviderContactDetails extends LightningElement {
    @api contactName;
    @api position;
    @api phoneNumber;
    @api emailAddress;
    @api helpText;

    handleEdit() {
        this.dispatchEvent(new CustomEvent('editcontact'));
    }
}