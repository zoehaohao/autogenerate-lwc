// qfrProgressIndicator.js
import { LightningElement, api } from 'lwc';
export default class QfrProgressIndicator extends LightningElement {
    @api currentPage;
    @api totalPages;
    get progressStyle() {
        const progress = (this.currentPage / this.totalPages) * 100;
        return `width: ${progress}%;`;
    }
}