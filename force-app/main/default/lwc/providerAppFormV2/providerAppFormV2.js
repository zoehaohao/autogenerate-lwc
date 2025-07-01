import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppFormV2 extends LightningElement {
    @track currentStep = 'step-1';
    @track openSections = ['declaration'];
    @track governanceOpenSections = [];
    @track isLoading = false;
    @track isSubmitting = false;

    // Declaration fields
    @track declarationValues = [];
    @track officer1Name = '';
    @track officer1Position = '';
    @track officer1Date = '';
    @track officer2Name = '';
    @track officer2Position = '';
    @track officer2Date = '';

    // Applicant details
    @track companyLegalName = '';
    @track companyACN = '';
    @track companyABN = '';
    @track businessName = '';
    @track registeredStreet = '';
    @track registeredSuburb = '';
    @track registeredState = '';
    @track registeredPostcode = '';
    @track sameAsRegistered = false;
    @track postalStreet = '';
    @track postalSuburb = '';
    @track postalState = '';
    @track postalPostcode = '';

    // Contact details
    @track primaryContactName = '';
    @track primaryContactPosition = '';
    @track primaryContactPhone = '';
    @track primaryContactMobile = '';
    @track primaryContactEmail = '';
    @track primaryContactBestTime = '';
    @track altContactName = '';
    @track altContactPosition = '';
    @track altContactPhone = '';
    @track altContactMobile = '';
    @track altContactEmail = '';
    @track altContactBestTime = '';

    // Consultant details
    @track consultantName = '';
    @track consultantPosition = '';
    @track consultantPhone = '';
    @track consultantMobile = '';
    @track consultantEmail = '';
    @track consultantServices = [];
    @track consultantOther = '';

    // Care types and organization
    @track careTypes = [];
    @track flexibleCareSetting = '';
    @track organisationType = '';
    @track notForProfitType = '';
    @track stockExchangeListed = '';

    // Corporate structure
    @track organisationStartPurpose = '';
    @track corporateStructure = '';
    @track businessModel = '';

    // Governance
    @track hasBoard = '';
    @track boardDetails = '';
    @track governanceMethodology = '';
    @track hasCommittees = '';
    @track committeeDetails = '';
    @track isFranchise = '';
    @track franchiseRelationship = '';
    @track franchiseLegalImplications = '';
    @track franchisePoliciesArrangements = '';

    // Service agreements
    @track hasServiceAgreement = '';
    @track multipleAgreements = '';
    @track agreementCount = '';
    @track serviceAgreementData = [];

    // Key personnel
    @track additionalKeyPersonnelCount = '';
    @track keyPersonnelData = [];
    @track keyPersonnelList = [
        {
            id: '1',
            number: '1',
            title: '',
            fullName: '',
            formerName: '',
            preferredName: '',
            dateOfBirth: '',
            positionTitle: '',
            contactEmail: '',
            contactMobile: '',
            contactLandline: '',
            preferredContact: '',
            principalDuties: '',
            employmentFrom: '',
            employmentTo: '',
            roleDescription: '',
            requiredAttachments: [],
            qualifications: [],
            experience: [],
            declarationValues: [],
            signatureDate: ''
        }
    ];

    // Suitability fields
    @track currentExperience = '';
    @track servicesProvidedData = [];
    @track boardExpertise = '';
    @track asicDeregistered = '';
    @track asicDetails = '';
    @track indictableOffence = '';
    @track indictableDetails = '';
    @track civilPenalty = '';
    @track civilPenaltyDetails = '';
    @track externalAssessment = '';
    @track assessmentPurpose = '';
    @track nonConformances = '';
    @track remedyActions = '';
    @track responsiblePersonnel = '';
    @track regulatoryAction = '';
    @track regulatoryActionDetails = '';
    @track regulatoryPersonnelRole = '';

    // Governance systems
    @track infoManagementSystems = '';
    @track infoManagementPolicies = '';
    @track infoManagementCompliance = '';
    @track infoManagementResponsible = '';
    @track continuousImprovementSystem = '';
    @track continuousImprovementPolicies = '';
    @track continuousImprovementCompliance = '';
    @track continuousImprovementResponsible = '';
    @track financialGovernanceSystem = '';
    @track financialGovernancePolicies = '';
    @track financialGovernanceCompliance = '';
    @track financialGovernanceResponsible = '';
    @track workforceGovernanceSystem = '';
    @track workforceGovernancePolicies = '';
    @track workforceGovernanceCompliance = '';
    @track workforceGovernanceResponsible = '';
    @track regulatoryComplianceSystem = '';
    @track regulatoryCompliancePolicies = '';
    @track regulatoryComplianceRequirement = '';
    @track regulatoryComplianceResponsible = '';
    @track riskManagementSystem = '';
    @track riskManagementPolicies = '';
    @track riskManagementCompliance = '';
    @track riskManagementResponsible = '';
    @track clinicalGovernanceSystem = '';
    @track clinicalGovernancePolicies = '';
    @track clinicalGovernanceCompliance = '';
    @track clinicalGovernanceResponsible = '';

    // Additional governance fields
    @track abuseNeglectResponse = '';
    @track sirsDescription = '';
    @track sirsResponsibilities = '';
    @track incidentManagementSystem = '';
    @track governanceSystemsCertification = '';
    @track homeCareDelivery = '';

    // Financial management
    @track financialManagementPolicies = '';
    @track financialManagementStrategy = '';
    @track financialStaffData = [];
    @track nonKeyPersonnelReason = '';
    @track financialActivities = '';
    @track financialQualifications = '';
    @track actualFinancialCapital = '';
    @track financialCapitalProportion = '';
    @track financialAssistanceReliance = '';
    @track contingencyAmounts = '';
    @track repaymentTerms = '';
    @track allocatedBudget = '';
    @track subsidyQuarantine = '';
    @track lumpSumExplanation = '';

    // Care type specific fields - Residential
    @track prudentialStandards = '';
    @track refundableDepositsReporting = '';
    @track facilityFinancing = '';
    @track restrictivePracticesResponsibilities = '';
    @track restrictivePracticesCompliance = '';
    @track restrictivePracticesPolicies = '';
    @track restrictivePracticesOversight = '';

    // Care type specific fields - Home Care
    @track homeCareDeliverySystem = '';
    @track healthStatusTools = '';
    @track careDeliverySystem = '';
    @track medicationManagement = '';
    @track choiceFlexibility = '';
    @track packagePortability = '';
    @track unspentAmounts = '';
    @track unspentAmountsResponsible = '';
    @track feesManagement = '';
    @track pricingInformation = '';
    @track pricingPolicy = '';

    // Care type specific fields - Flexible Care
    @track flexibleCareExperience = '';
    @track restorativeCarePolicies = '';
    @track careRecipientStatements = '';
    @track carePlanningDelivery = '';
    @track dailyFeesTracking = '';
    @track functionalStatusChanges = '';
    @track multidisciplinaryTeams = '';

    // Options arrays
    get declarationOptions() {
        return [
            { label: 'are aware that, under section 63J(1)(c) of the Commission Act, if the Commissioner is satisfied that the application contained information that was false or misleading in a material particular, any approval as an approved provider must be revoked.', value: 'aware_revocation' },
            { label: 'understand that Chapter 2 and section 137.1 of the Criminal Code applies to offences against the Commission Act. Providing false or misleading information in this application is a serious offence.', value: 'understand_criminal_code' },
            { label: 'have provided true and accurate information in this application form.', value: 'true_accurate_info' },
            { label: 'understand that the application form must be signed by persons lawfully authorised to act on behalf of/represent the organisation.', value: 'understand_authorisation' },
            { label: 'consent to the Commissioner obtaining information and documents from other persons or organisations.', value: 'consent_information' },
            { label: 'understand that information I/we give to the Commission may be disclosed where permitted or required by law.', value: 'understand_disclosure' },
            { label: 'understand that the corporation name shown on the Certificate of Registration provided with this application will be used in any communications and to establish/update system records.', value: 'understand_corporation_name' },
            { label: 'declare that all of our/my organisation\'s key personnel are individuals suitable to be involved in the provision of aged care.', value: 'declare_suitable_personnel' },
            { label: 'have read the Aged Care Approved Provider Applicant Guide and understand the responsibilities and obligations of approved providers.', value: 'read_guide' },
            { label: 'understand that the Commission will examine its own records in relation to this application.', value: 'understand_records_examination' },
            { label: 'understand that if a consultant or external party is engaged to assist in preparing this application, our/my organisation is ultimately responsible for the information provided.', value: 'understand_consultant_responsibility' }
        ];
    }

    get stateOptions() {
        return [
            { label: 'NSW', value: 'NSW' },
            { label: 'VIC', value: 'VIC' },
            { label: 'QLD', value: 'QLD' },
            { label: 'WA', value: 'WA' },
            { label: 'SA', value: 'SA' },
            { label: 'TAS', value: 'TAS' },
            { label: 'ACT', value: 'ACT' },
            { label: 'NT', value: 'NT' }
        ];
    }

    get consultantServiceOptions() {
        return [
            { label: 'Completed this form', value: 'completed_form' },
            { label: 'Developed our policies and procedures', value: 'developed_policies' },
            { label: 'Provided advice', value: 'provided_advice' },
            { label: 'Other', value: 'other' }
        ];
    }

    get careTypeOptions() {
        return [
            { label: 'Residential Care - complete Section 4.1', value: 'residential' },
            { label: 'Home Care - complete Section 4.2', value: 'home' },
            { label: 'Flexible Care - complete Section 4.3', value: 'flexible' }
        ];
    }

    get flexibleCareSettingOptions() {
        return [
            { label: 'in a residential care setting', value: 'residential_setting' },
            { label: 'in a home care setting', value: 'home_setting' }
        ];
    }

    get organisationTypeOptions() {
        return [
            { label: 'For Profit', value: 'for_profit' },
            { label: 'Not-For-Profit', value: 'not_for_profit' }
        ];
    }

    get notForProfitOptions() {
        return [
            { label: 'Religious', value: 'religious' },
            { label: 'Community Based', value: 'community_based' },
            { label: 'Charitable', value: 'charitable' }
        ];
    }

    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
        ];
    }

    get titleOptions() {
        return [
            { label: 'Mr', value: 'mr' },
            { label: 'Mrs', value: 'mrs' },
            { label: 'Ms', value: 'ms' },
            { label: 'Dr', value: 'dr' },
            { label: 'Prof', value: 'prof' }
        ];
    }

    get contactMethodOptions() {
        return [
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Mobile', value: 'mobile' }
        ];
    }

    get requiredAttachmentsOptions() {
        return [
            { label: 'NPC or NCHC or NDIS worker screening check attached', value: 'police_check' },
            { label: 'Insolvency check attached', value: 'insolvency_check' },
            { label: 'Statutory declaration attached', value: 'statutory_declaration' }
        ];
    }

    get keyPersonnelDeclarationOptions() {
        return [
            { label: 'am aware that, under section 63J(1)(c) of the Commission Act, if the Commissioner is satisfied that the application contained information that was false or misleading in a material particular, any approval as an approved provider must be revoked.', value: 'aware_revocation' },
            { label: 'understand that Chapter 2 and section 137.1 of the Criminal Code applies to offences against the Commission Act.', value: 'understand_criminal_code' },
            { label: 'have read and confirm that the information provided in this application form about me is true and correct.', value: 'confirm_true_info' },
            { label: 'am aware that this declaration covers all information provided in the application about me and my role as key personnel.', value: 'aware_declaration_scope' },
            { label: 'consent to the Commissioner obtaining information and documents from other persons or organisations.', value: 'consent_information' },
            { label: 'have read and understood the Commissions Privacy Policy regarding the collection of information about me.', value: 'understand_privacy' },
            { label: 'declare that I have read and understood the suitability matters in relation to an individual as set out under section 8C of the Commission Act.', value: 'understand_suitability' },
            { label: 'understand my responsibilities as key personnel to notify the approved provider within 14 days of becoming aware of a change of circumstances.', value: 'understand_notification' },
            { label: 'understand that the Commission will examine its own records in relation to this application and any Code of Conduct matters.', value: 'understand_records' }
        ];
    }

    // Column definitions for data tables
    get serviceAgreementColumns() {
        return [
            { label: 'Registered Name', fieldName: 'registeredName', type: 'text', editable: true },
            { label: 'Business Name', fieldName: 'businessName', type: 'text', editable: true },
            { label: 'ABN', fieldName: 'abn', type: 'text', editable: true },
            { label: 'ACN/IAN', fieldName: 'acn', type: 'text', editable: true },
            { label: 'Contact Name', fieldName: 'contactName', type: 'text', editable: true },
            { label: 'Phone', fieldName: 'phone', type: 'phone', editable: true },
            { label: 'Email', fieldName: 'email', type: 'email', editable: true },
            { label: 'Contract Start Date', fieldName: 'contractStartDate', type: 'date', editable: true },
            { label: 'Contract End Date', fieldName: 'contractEndDate', type: 'date', editable: true }
        ];
    }

    get keyPersonnelColumns() {
        return [
            { label: 'Name', fieldName: 'fullName', type: 'text', editable: true },
            { label: 'Position', fieldName: 'positionTitle', type: 'text', editable: true },
            { label: 'Email', fieldName: 'contactEmail', type: 'email', editable: true },
            { label: 'Mobile', fieldName: 'contactMobile', type: 'phone', editable: true },
            { label: 'Date of Birth', fieldName: 'dateOfBirth', type: 'date', editable: true }
        ];
    }

    get qualificationsColumns() {
        return [
            { label: 'Qualification Title', fieldName: 'title', type: 'text', editable: true },
            { label: 'Educational Facility', fieldName: 'facility', type: 'text', editable: true },
            { label: 'Date Obtained', fieldName: 'dateObtained', type: 'date', editable: true },
            { label: 'Date Started (if studying)', fieldName: 'dateStarted', type: 'date', editable: true }
        ];
    }

    get experienceColumns() {
        return [
            { label: 'Employer Name', fieldName: 'employerName', type: 'text', editable: true },
            { label: 'From Date', fieldName: 'fromDate', type: 'date', editable: true },
            { label: 'To Date', fieldName: 'toDate', type: 'date', editable: true },
            { label: 'Role Description', fieldName: 'roleDescription', type: 'text', editable: true }
        ];
    }

    get servicesProvidedColumns() {
        return [
            { label: 'Service Delivered', fieldName: 'serviceDelivered', type: 'text', editable: true },
            { label: 'Period of Delivery', fieldName: 'periodOfDelivery', type: 'text', editable: true },
            { label: 'Number of Care Recipients', fieldName: 'numberOfRecipients', type: 'number', editable: true }
        ];
    }

    get financialStaffColumns() {
        return [
            { label: 'First and Last Name', fieldName: 'fullName', type: 'text', editable: true },
            { label: 'Is Key Personnel', fieldName: 'isKeyPersonnel', type: 'boolean', editable: true }
        ];
    }

    // Computed properties for conditional display
    get showFlexibleCareSettings() {
        return this.careTypes.includes('flexible');
    }

    get showNotForProfitOptions() {
        return this.organisationType === 'not_for_profit';
    }

    get showCommitteeDetails() {
        return this.hasCommittees === 'yes';
    }

    get showFranchiseDetails() {
        return this.isFranchise === 'yes';
    }

    get showServiceAgreementDetails() {
        return this.hasServiceAgreement === 'yes';
    }

    get showMultipleAgreementsCount() {
        return this.multipleAgreements === 'yes';
    }

    get showAsicDetails() {
        return this.asicDeregistered === 'yes';
    }

    get showIndictableDetails() {
        return this.indictableOffence === 'yes';
    }

    get showCivilPenaltyDetails() {
        return this.civilPenalty === 'yes';
    }

    get showExternalAssessmentDetails() {
        return this.externalAssessment === 'yes';
    }

    get showRegulatoryActionDetails() {
        return this.regulatoryAction === 'yes';
    }

    get showHomeCareDeliveryQuestion() {
        return this.careTypes.includes('home') || this.careTypes.includes('flexible');
    }

    get showResidentialCare() {
        return this.careTypes.includes('residential');
    }

    get showHomeCare() {
        return this.careTypes.includes('home');
    }

    get showFlexibleCare() {
        return this.careTypes.includes('flexible');
    }

    // Initialize data
    connectedCallback() {
        this.initializeData();
    }

    initializeData() {
        // Initialize service agreement data with sample data
        this.serviceAgreementData = [
            {
                id: '1',
                registeredName: 'Sample Service Provider Pty Ltd',
                businessName: 'Sample Care Services',
                abn: '12 345 678 901',
                acn: '123456789',
                contactName: 'John Smith',
                phone: '02 9876 5432',
                email: 'john.smith@samplecare.com.au',
                contractStartDate: '2023-01-01',
                contractEndDate: '2025-12-31'
            }
        ];

        // Initialize services provided data
        this.servicesProvidedData = [
            {
                id: '1',
                serviceDelivered: 'Personal Care',
                periodOfDelivery: '01/01/2020 to current',
                numberOfRecipients: 25
            },
            {
                id: '2',
                serviceDelivered: 'Domestic Assistance',
                periodOfDelivery: '01/06/2020 to current',
                numberOfRecipients: 15
            }
        ];

        // Initialize financial staff data
        this.financialStaffData = [
            {
                id: '1',
                fullName: 'Jane Doe',
                isKeyPersonnel: true
            }
        ];

        // Initialize key personnel qualifications and experience
        this.keyPersonnelList[0].qualifications = [
            {
                id: '1',
                title: 'Bachelor of Nursing',
                facility: 'University of Sydney',
                dateObtained: '2015-12-01',
                dateStarted: ''
            }
        ];

        this.keyPersonnelList[0].experience = [
            {
                id: '1',
                employerName: 'Sydney Health Services',
                fromDate: '2016-01-01',
                toDate: '2020-12-31',
                roleDescription: 'Registered Nurse providing direct patient care in aged care facility'
            }
        ];
    }

    // Event handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleGovernanceAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.governanceOpenSections = openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        this[fieldName] = value;

        // Handle conditional logic
        if (fieldName === 'organisationType') {
            this.handleOrganisationTypeChange(event);
        }
    }

    handleDeclarationChange(event) {
        this.declarationValues = event.detail.value;
    }

    handleConsultantServicesChange(event) {
        this.consultantServices = event.detail.value;
    }

    handleCareTypeChange(event) {
        this.careTypes = event.detail.value;
    }

    handleOrganisationTypeChange(event) {
        this.organisationType = event.detail.value;
        if (this.organisationType !== 'not_for_profit') {
            this.notForProfitType = '';
        }
    }

    handleSameAddressChange(event) {
        this.sameAsRegistered = event.target.checked;
        if (this.sameAsRegistered) {
            this.postalStreet = this.registeredStreet;
            this.postalSuburb = this.registeredSuburb;
            this.postalState = this.registeredState;
            this.postalPostcode = this.registeredPostcode;
        }
    }

    handleKeyPersonnelChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        const personId = event.target.dataset.id;

        const personIndex = this.keyPersonnelList.findIndex(person => person.id === personId);
        if (personIndex !== -1) {
            this.keyPersonnelList[personIndex][fieldName] = value;
            this.keyPersonnelList = [...this.keyPersonnelList];
        }
    }

    // Data table event handlers
    handleServiceAgreementCellChange(event) {
        const draftValues = event.detail.draftValues;
        const updatedData = [...this.serviceAgreementData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                Object.keys(draft).forEach(key => {
                    if(key !== 'id') {
                        updatedData[index][key] = draft[key];
                    }
                });
            }
        });
        
        this.serviceAgreementData = updatedData;
    }

    handleKeyPersonnelCellChange(event) {
        const draftValues = event.detail.draftValues;
        const updatedData = [...this.keyPersonnelData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                Object.keys(draft).forEach(key => {
                    if (key !== 'id') {
                        updatedData[index][key] = draft[key];
                    }
                });
            }
        });
        
        this.keyPersonnelData = updatedData;
    }

    handleQualificationsCellChange(event) {
        const draftValues = event.detail.draftValues;
        const personId = event.target.dataset.personId;
        
        const personIndex = this.keyPersonnelList.findIndex(person => person.id === personId);
        if (personIndex !== -1) {
            const updatedQualifications = [...this.keyPersonnelList[personIndex].qualifications];
            
            draftValues.forEach(draft => {
                const index = updatedQualifications.findIndex(item => item.id === draft.id);
                if (index !== -1) {
                    Object.keys(draft).forEach(key => {
                        if (key !== 'id') {
                            updatedQualifications[index][key] = draft[key];
                        }
                    });
                }
            });
            
            this.keyPersonnelList[personIndex].qualifications = updatedQualifications;
            this.keyPersonnelList = [...this.keyPersonnelList];
        }
    }

    handleExperienceCellChange(event) {
        const draftValues = event.detail.draftValues;
        const personId = event.target.dataset.personId;
        
        const personIndex = this.keyPersonnelList.findIndex(person => person.id === personId);
        if (personIndex !== -1) {
            const updatedExperience = [...this.keyPersonnelList[personIndex].experience];
            
            draftValues.forEach(draft => {
                const index = updatedExperience.findIndex(item => item.id === draft.id);
                if (index !== -1) {
                    Object.keys(draft).forEach(key => {
                        if (key !== 'id') {
                            updatedExperience[index][key] = draft[key];
                        }
                    });
                }
            });
            
            this.keyPersonnelList[personIndex].experience = updatedExperience;
            this.keyPersonnelList = [...this.keyPersonnelList];
        }
    }

    handleServicesProvidedCellChange(event) {
        const draftValues = event.detail.draftValues;
        const updatedData = [...this.servicesProvidedData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                Object.keys(draft).forEach(key => {
                    if (key !== 'id') {
                        updatedData[index][key] = draft[key];
                    }
                });
            }
        });
        
        this.servicesProvidedData = updatedData;
    }

    handleFinancialStaffCellChange(event) {
        const draftValues = event.detail.draftValues;
        const updatedData = [...this.financialStaffData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                Object.keys(draft).forEach(key => {
                    if (key !== 'id') {
                        updatedData[index][key] = draft[key];
                    }
                });
            }
        });
        
        this.financialStaffData = updatedData;
    }

    // Add/Remove handlers
    handleAddServiceAgreement() {
        const newId = String(this.serviceAgreementData.length + 1);
        const newAgreement = {
            id: newId,
            registeredName: '',
            businessName: '',
            abn: '',
            acn: '',
            contactName: '',
            phone: '',
            email: '',
            contractStartDate: '',
            contractEndDate: ''
        };
        this.serviceAgreementData = [...this.serviceAgreementData, newAgreement];
    }

    handleAddKeyPersonnel() {
        const newId = String(this.keyPersonnelList.length + 1);
        const newPerson = {
            id: newId,
            number: newId,
            title: '',
            fullName: '',
            formerName: '',
            preferredName: '',
            dateOfBirth: '',
            positionTitle: '',
            contactEmail: '',
            contactMobile: '',
            contactLandline: '',
            preferredContact: '',
            principalDuties: '',
            employmentFrom: '',
            employmentTo: '',
            roleDescription: '',
            requiredAttachments: [],
            qualifications: [],
            experience: [],
            declarationValues: [],
            signatureDate: ''
        };
        this.keyPersonnelList = [...this.keyPersonnelList, newPerson];
    }

    handleAddQualification(event) {
        const personId = event.target.dataset.personId;
        const personIndex = this.keyPersonnelList.findIndex(person => person.id === personId);
        
        if (personIndex !== -1) {
            const newId = String(this.keyPersonnelList[personIndex].qualifications.length + 1);
            const newQualification = {
                id: newId,
                title: '',
                facility: '',
                dateObtained: '',
                dateStarted: ''
            };
            
            this.keyPersonnelList[personIndex].qualifications = [
                ...this.keyPersonnelList[personIndex].qualifications,
                newQualification
            ];
            this.keyPersonnelList = [...this.keyPersonnelList];
        }
    }

    handleAddExperience(event) {
        const personId = event.target.dataset.personId;
        const personIndex = this.keyPersonnelList.findIndex(person => person.id === personId);
        
        if (personIndex !== -1) {
            const newId = String(this.keyPersonnelList[personIndex].experience.length + 1);
            const newExperience = {
                id: newId,
                employerName: '',
                fromDate: '',
                toDate: '',
                roleDescription: ''
            };
            
            this.keyPersonnelList[personIndex].experience = [
                ...this.keyPersonnelList[personIndex].experience,
                newExperience
            ];
            this.keyPersonnelList = [...this.keyPersonnelList];
        }
    }

    handleAddService() {
        const newId = String(this.servicesProvidedData.length + 1);
        const newService = {
            id: newId,
            serviceDelivered: '',
            periodOfDelivery: '',
            numberOfRecipients: 0
        };
        this.servicesProvidedData = [...this.servicesProvidedData, newService];
    }

    handleAddFinancialStaff() {
        const newId = String(this.financialStaffData.length + 1);
        const newStaff = {
            id: newId,
            fullName: '',
            isKeyPersonnel: false
        };
        this.financialStaffData = [...this.financialStaffData, newStaff];
    }

    // Form action handlers
    handleSaveDraft() {
        this.isLoading = true;
        
        try {
            // Simulate save operation
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'Draft saved successfully', 'success');
            }, 2000);
        } catch (error) {
            this.isLoading = false;
            this.showToast('Error', 'Failed to save draft: ' + error.message, 'error');
        }
    }

    handleValidateForm() {
        this.isLoading = true;
        
        try {
            const validationResults = this.validateForm();
            
            setTimeout(() => {
                this.isLoading = false;
                
                if (validationResults.isValid) {
                    this.showToast('Success', 'Form validation passed', 'success');
                } else {
                    this.showToast('Validation Error', validationResults.message, 'error');
                }
            }, 1500);
        } catch (error) {
            this.isLoading = false;
            this.showToast('Error', 'Validation failed: ' + error.message, 'error');
        }
    }

    handleSubmitApplication() {
        const validationResults = this.validateForm();
        
        if (!validationResults.isValid) {
            this.showToast('Validation Error', validationResults.message, 'error');
            return;
        }

        this.isSubmitting = true;
        this.isLoading = true;
        
        try {
            // Simulate submission
            setTimeout(() => {
                this.isSubmitting = false;
                this.isLoading = false;
                this.showToast('Success', 'Application submitted successfully', 'success');
            }, 3000);
        } catch (error) {
            this.isSubmitting = false;
            this.isLoading = false;
            this.showToast('Error', 'Failed to submit application: ' + error.message, 'error');
        }
    }

    // Validation logic
    validateForm() {
        const errors = [];

        // Required field validations
        if (!this.companyLegalName) {
            errors.push('Company Legal Name is required');
        }

        if (!this.companyACN) {
            errors.push('Company ACN is required');
        }

        if (!this.companyABN) {
            errors.push('Company ABN is required');
        }

        if (!this.registeredStreet) {
            errors.push('Registered business address is required');
        }

        if (!this.registeredSuburb) {
            errors.push('Registered suburb is required');
        }

        if (!this.registeredState) {
            errors.push('Registered state is required');
        }

        if (!this.registeredPostcode) {
            errors.push('Registered postcode is required');
        }

        if (!this.primaryContactName) {
            errors.push('Primary contact name is required');
        }

        if (!this.primaryContactEmail) {
            errors.push('Primary contact email is required');
        }

        if (this.careTypes.length === 0) {
            errors.push('At least one care type must be selected');
        }

        if (!this.organisationType) {
            errors.push('Organisation type is required');
        }

        if (!this.officer1Name) {
            errors.push('Declaring Officer 1 name is required');
        }

        if (!this.officer1Position) {
            errors.push('Declaring Officer 1 position is required');
        }

        if (!this.officer1Date) {
            errors.push('Declaring Officer 1 date is required');
        }

        if (this.declarationValues.length === 0) {
            errors.push('Declaration checkboxes must be selected');
        }

        // Email validation
        if (this.primaryContactEmail && !this.isValidEmail(this.primaryContactEmail)) {
            errors.push('Primary contact email format is invalid');
        }

        if (this.altContactEmail && !this.isValidEmail(this.altContactEmail)) {
            errors.push('Alternative contact email format is invalid');
        }

        // Postcode validation
        if (this.registeredPostcode && !this.isValidPostcode(this.registeredPostcode)) {
            errors.push('Registered postcode must be 4 digits');
        }

        if (this.postalPostcode && !this.isValidPostcode(this.postalPostcode)) {
            errors.push('Postal postcode must be 4 digits');
        }

        // Key personnel validation
        for (let person of this.keyPersonnelList) {
            if (!person.fullName) {
                errors.push(`Key Personnel ${person.number}: Full name is required`);
            }
            if (!person.positionTitle) {
                errors.push(`Key Personnel ${person.number}: Position title is required`);
            }
            if (!person.contactEmail) {
                errors.push(`Key Personnel ${person.number}: Contact email is required`);
            }
            if (person.contactEmail && !this.isValidEmail(person.contactEmail)) {
                errors.push(`Key Personnel ${person.number}: Contact email format is invalid`);
            }
            if (!person.dateOfBirth) {
                errors.push(`Key Personnel ${person.number}: Date of birth is required`);
            }
            if (!person.principalDuties) {
                errors.push(`Key Personnel ${person.number}: Principal duties are required`);
            }
            if (!person.roleDescription) {
                errors.push(`Key Personnel ${person.number}: Role description is required`);
            }
            if (!person.signatureDate) {
                errors.push(`Key Personnel ${person.number}: Signature date is required`);
            }
            if (person.declarationValues.length === 0) {
                errors.push(`Key Personnel ${person.number}: Declaration must be completed`);
            }
        }

        return {
            isValid: errors.length === 0,
            message: errors.length > 0 ? errors.join('; ') : 'Validation passed'
        };
    }

    // Helper methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPostcode(postcode) {
        const postcodeRegex = /^\d{4}$/;
        return postcodeRegex.test(postcode);
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
