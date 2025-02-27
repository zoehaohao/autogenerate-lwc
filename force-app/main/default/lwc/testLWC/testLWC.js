import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EmpAppForm extends LightningElement {
 @track formData = {
 firstName: '',
 middleName: '',
 lastName: '',
 street: '',
 city: '',
 state: '',
 zipCode: ''
 };

 handleInputChange(event) {
 const field = event.target.id;
 this.formData[field] = event.target.value;
 }

 handleSubmit() {
 if (this.validateForm()) {
 // Here you would typically send the data to a server
 console.log('Form submitted:', this.formData);
 this.showToast('Success', 'Form submitted successfully', 'success');
 this.resetForm();
 }
 }

 validateForm() {
 const allValid = [...this.template.querySelectorAll('input')]
 .reduce((validSoFar, inputField) => {
 inputField.reportValidity();
 return validSoFar && inputField.checkValidity();
 }, true);

 if (!allValid) {
 this.showToast('Error', 'Please fill all required fields', 'error');
 return false;
 }

 if (!this.validateZipCode()) {
 this.showToast('Error', 'Please enter a valid zip code', 'error');
 return false;
 }

 return true;
 }

 validateZipCode() {
 const zipCodeRegex = /^\d{5}(-\d{4})?$/;
 return zipCodeRegex.test(this.formData.zipCode);
 }

 resetForm() {
 this.formData = {
 firstName: '',
 middleName: '',
 lastName: '',
 street: '',
 city: '',
 state: '',
 zipCode: ''
 };
 this.template.querySelectorAll('input').forEach(input => {
 input.value = '';
 });
 this.template.querySelector('select').value = '';
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