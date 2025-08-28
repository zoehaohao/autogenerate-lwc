import { LightningElement, api } from 'lwc';

export default class StrandsTestV5 extends LightningElement {
    @api recordId;
    
    handleClick() {
        // Example click handler
        console.log('Button clicked');
    }

    // Example of a computed property
    get buttonVariant() {
        return 'brand';
    }
}