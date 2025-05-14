// agedCareRecipientFeedbackForm.js (continued)
    validatePhoneNumber() {
        const phoneRegex = /^(\+61|0)[2-478](?:[ -]?[0-9]){8}$/;
        if (this.formData.respondentPhone && !phoneRegex.test(this.formData.respondentPhone)) {
            this.errorMessage = 'Please enter a valid Australian phone number.';
            return false;
        }
        return true;
    }

    resetForm() {
        this.formData = {
            careType: [],
            respondentName: '',
            respondentPhone: '',
            role: '',
            veteranStatus: '',
            comfortLevel: '',
            staffMeetsNeeds: '',
            specializedCare: '',
            providerOffersSpecializedCare: '',
            specializedCareDetails: '',
            additionalComments: ''
        };
        this.showVeteranStatus = false;
        this.showVeteranFeedback = false;
        this.isSubmitDisabled = true;
        this.template.querySelectorAll('input, select, textarea').forEach(element => {
            element.value = '';
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = false;
            }
        });
    }
}