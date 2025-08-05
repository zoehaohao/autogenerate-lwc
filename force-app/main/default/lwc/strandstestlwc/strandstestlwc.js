import { LightningElement } from 'lwc';

export default class Strandstestlwc extends LightningElement {
    handleEdit() {
        // Handle edit button click
        // This would typically navigate to edit mode or show edit form
        const editEvent = new CustomEvent('edit', {
            detail: {
                action: 'edit_contact'
            }
        });
        this.dispatchEvent(editEvent);
    }
}