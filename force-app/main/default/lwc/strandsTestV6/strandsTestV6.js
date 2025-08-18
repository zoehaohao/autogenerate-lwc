import { LightningElement } from 'lwc';

export default class StrandsTestV6 extends LightningElement {
    handleClick() {
        // Handle button click
        console.log('Button clicked!');
        this.dispatchEvent(
            new CustomEvent('buttonclick', {
                detail: {
                    message: 'Button was clicked'
                }
            })
        );
    }
}