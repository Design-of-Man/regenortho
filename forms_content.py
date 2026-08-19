"""Patient form definitions for RegenOrtho Palm Beach.

Edit the structures here and re-run `python3 build.py` to regenerate the forms.

FIELD SPEC — every field is a dict:
  t      field type: text | tel | email | date | select | textarea | yesno |
                     checks | scale | ack | note
  id     unique slug (becomes the input id/name — keep it stable)
  label  the question
  req    True to make it required
  hint   small helper line under the label
  ph     placeholder / textarea prompt
  ac     autocomplete token. OMIT on anything clinical — the renderer defaults
         those to "off" so browsers don't retain health answers.
  w      "half" to sit two-up on desktop (default is full width)
  opts   options list for select / checks
  follow a nested field revealed only when the answer is Yes

IMPORTANT — these forms are deliberately built to keep protected health
information (PHI) inside the patient's own browser. See HIPAA NOTES in
README.md before wiring any of this to a server, an email address, or a
third-party form service.
"""

# --------------------------------------------------------------------------
# Shared blocks
# --------------------------------------------------------------------------

MEDS_ALLERGIES = [
    {"t": "textarea", "id": "medications", "label": "Current Medications",
     "ph": "List all current medications, including dosages"},
    {"t": "textarea", "id": "supplements", "label": "Current Supplements",
     "ph": "List all current supplements"},
    {"t": "textarea", "id": "allergies", "label": "Known Allergies",
     "ph": "List any known allergies (medications, food, environmental)"},
]

ACK_TEXT = ("I certify that the information provided is accurate and complete to the best of "
            "my knowledge. I understand that this questionnaire is for screening purposes and "
            "does not constitute medical advice. A physician will review my responses and "
            "determine eligibility for the requested therapies.")

ACK_TEXT_INTAKE = ("I certify that the information provided is accurate and complete to the best "
                   "of my knowledge. I understand that this form is used to prepare for my visit "
                   "and does not constitute medical advice or establish a treatment plan. A "
                   "provider will review my responses with me at my appointment.")


# --------------------------------------------------------------------------
# Peptide & GLP-1 questionnaire
# --------------------------------------------------------------------------

GLP_FORM = {
    "slug": "peptide-glp-questionnaire",
    "name": "Peptide &amp; GLP-1 Questionnaire",
    "plain_name": "Peptide & GLP-1 Questionnaire",
    "lede": "Please complete this form prior to your consultation. All information is kept confidential.",
    "title": "Peptide & GLP-1 Questionnaire | RegenOrtho Palm Beach",
    "desc": ("Complete the RegenOrtho Palm Beach peptide & GLP-1 screening questionnaire before your "
             "consultation — private, filled out entirely in your browser."),
    "ack": ACK_TEXT,
    "card": {
        "for_who": "Anyone starting peptide, NAD+, or GLP-1 weight-loss therapy with us.",
        "covers": ["Medications, supplements &amp; allergies",
                   "Prior GLP-1, peptide, NAD+ &amp; hormone therapy",
                   "Screening history a physician needs before prescribing",
                   "Your treatment goals"],
        "icon": '<path d="M8.5 15.5 15.5 8.5M9.6 6.4l-3.2 3.2a3.4 3.4 0 0 0 4.8 4.8l3.2-3.2M14.4 17.6l3.2-3.2a3.4 3.4 0 0 0-4.8-4.8L9.6 12.8"/>',
    },
    "sections": [
        {"n": "01", "title": "Patient Information", "fields": [
            {"t": "text", "id": "full-name", "label": "Full Name", "req": True, "ac": "name", "w": "half"},
            {"t": "date", "id": "dob", "label": "Date of Birth", "req": True, "ac": "bday", "w": "half"},
            {"t": "select", "id": "sex", "label": "Sex", "w": "half",
             "opts": ["Female", "Male", "Prefer not to say"]},
            {"t": "tel", "id": "phone", "label": "Phone", "ac": "tel", "w": "half"},
            {"t": "email", "id": "email", "label": "Email", "req": True, "ac": "email", "w": "half"},
        ]},
        {"n": "02", "title": "Primary Care Provider", "fields": [
            {"t": "text", "id": "pcp-name", "label": "PCP Name", "w": "half"},
            {"t": "tel", "id": "pcp-phone", "label": "PCP Phone", "w": "half"},
            {"t": "text", "id": "pcp-clinic", "label": "Clinic / Practice Name", "w": "half"},
            {"t": "date", "id": "last-physical", "label": "Date of Last Physical", "w": "half"},
            {"t": "yesno", "id": "records-release", "label": "May we request records?"},
        ]},
        {"n": "03", "title": "Medications &amp; Allergies", "fields": list(MEDS_ALLERGIES)},
        {"n": "04", "title": "Treatment History", "fields": [
            {"t": "yesno", "id": "glp-history",
             "label": "Have you used GLP-1 medications before (e.g. semaglutide, tirzepatide)?",
             "follow": {"t": "text", "id": "glp-history-detail",
                        "label": "If yes, which medication and for how long?"}},
            {"t": "yesno", "id": "rx-weightloss-history",
             "label": "Have you used other prescription weight loss medications?",
             "follow": {"t": "text", "id": "rx-weightloss-detail", "label": "If yes, please specify"}},
            {"t": "yesno", "id": "peptide-history", "label": "Have you used peptide therapy before?",
             "follow": {"t": "text", "id": "peptide-detail",
                        "label": "If yes, which peptides and for what purpose?"}},
            {"t": "yesno", "id": "nad-history", "label": "Have you used NAD+ therapy before?",
             "follow": {"t": "text", "id": "nad-detail", "label": "If yes, please describe"}},
            {"t": "yesno", "id": "hrt-history",
             "label": "Have you used hormone replacement therapy (HRT)?",
             "follow": {"t": "text", "id": "hrt-detail", "label": "If yes, please describe"}},
            {"t": "yesno", "id": "self-injection", "label": "Are you comfortable with self-injection?"},
            {"t": "yesno", "id": "programs-history",
             "label": "Have you tried previous weight loss programs (diet, exercise, coaching)?",
             "follow": {"t": "text", "id": "programs-detail", "label": "If yes, please describe"}},
        ]},
        {"n": "05", "title": "Medical History", "grid": True,
         "intro": "Do you have, or have you ever been diagnosed with, any of the following?",
         "fields": [
            {"t": "yesno", "id": "mh-pancreatitis", "label": "History of pancreatitis"},
            {"t": "yesno", "id": "mh-gallbladder", "label": "Gallbladder disease or removal"},
            {"t": "yesno", "id": "mh-mtc",
             "label": "Personal or family history of medullary thyroid carcinoma (MTC) or MEN 2"},
            {"t": "yesno", "id": "mh-gastroparesis", "label": "Gastroparesis"},
            {"t": "yesno", "id": "mh-eating-disorder", "label": "Eating disorder (current or past)"},
            {"t": "yesno", "id": "mh-diabetes", "label": "Diabetes (Type 1 or Type 2)",
             "follow": {"t": "text", "id": "mh-diabetes-detail",
                        "label": "If yes, type and current management"}},
            {"t": "yesno", "id": "mh-hypoglycemia", "label": "Hypoglycemia"},
            {"t": "yesno", "id": "mh-thyroid", "label": "Thyroid disorder",
             "follow": {"t": "text", "id": "mh-thyroid-detail", "label": "If yes, please specify"}},
            {"t": "yesno", "id": "mh-kidney", "label": "Kidney disease"},
            {"t": "yesno", "id": "mh-liver", "label": "Liver disease"},
            {"t": "yesno", "id": "mh-cardiac", "label": "Cardiac disease"},
            {"t": "yesno", "id": "mh-hypertension", "label": "Hypertension",
             "follow": {"t": "text", "id": "mh-hypertension-detail",
                        "label": "If yes, current medications"}},
            {"t": "yesno", "id": "mh-dyslipidemia",
             "label": "Dyslipidemia (high cholesterol / triglycerides)",
             "follow": {"t": "text", "id": "mh-dyslipidemia-detail",
                        "label": "If yes, current medications"}},
            {"t": "yesno", "id": "mh-clots", "label": "Blood clots, DVT, or pulmonary embolism"},
            {"t": "yesno", "id": "mh-cancer-active", "label": "Active cancer",
             "follow": {"t": "text", "id": "mh-cancer-active-detail",
                        "label": "If yes, type and treatment"}},
            {"t": "yesno", "id": "mh-cancer-remission", "label": "History of cancer (in remission)",
             "follow": {"t": "text", "id": "mh-cancer-remission-detail",
                        "label": "If yes, type and when"}},
            {"t": "yesno", "id": "mh-autoimmune", "label": "Autoimmune condition",
             "follow": {"t": "text", "id": "mh-autoimmune-detail", "label": "If yes, please specify"}},
            {"t": "yesno", "id": "mh-psychiatric",
             "label": "Psychiatric condition (anxiety, depression, etc.)",
             "follow": {"t": "text", "id": "mh-psychiatric-detail", "label": "If yes, please specify"}},
            {"t": "yesno", "id": "mh-sleep-apnea", "label": "Sleep apnea"},
            {"t": "yesno", "id": "mh-pregnancy", "label": "Pregnant, planning pregnancy, or nursing"},
            {"t": "yesno", "id": "mh-recent-surgery", "label": "Recent surgery (within past 6 months)",
             "follow": {"t": "text", "id": "mh-recent-surgery-detail",
                        "label": "If yes, type and date"}},
            {"t": "yesno", "id": "mh-bariatric", "label": "History of bariatric surgery",
             "follow": {"t": "text", "id": "mh-bariatric-detail", "label": "If yes, type and date"}},
         ]},
        {"n": "06", "title": "Lifestyle", "fields": [
            {"t": "yesno", "id": "tobacco", "label": "Tobacco or nicotine use",
             "follow": {"t": "text", "id": "tobacco-detail", "label": "If yes, type and frequency"}},
            {"t": "yesno", "id": "alcohol", "label": "Alcohol use (more than 7 drinks per week)",
             "follow": {"t": "text", "id": "alcohol-detail",
                        "label": "If yes, approximate drinks per week"}},
            {"t": "yesno", "id": "recreational-drugs", "label": "Recreational drug use"},
        ]},
        {"n": "07", "title": "Treatment Goals", "fields": [
            {"t": "checks", "id": "goals", "label": "Treatment interests",
             "hint": "Select all that apply to your treatment interests.",
             "opts": ["Weight loss", "Muscle recovery", "Anti-aging &amp; longevity",
                      "Fat loss &amp; body comp.", "Cognitive performance", "Joint &amp; tissue repair",
                      "Improved sleep", "Energy &amp; vitality", "Sexual health &amp; libido",
                      "Immune support", "Gut health", "Hair, skin &amp; nails",
                      "Hormone optimization"]},
            {"t": "textarea", "id": "goals-other", "label": "Other Goals",
             "ph": "Please describe any additional treatment goals"},
        ]},
        {"n": "08", "title": "Additional Information", "fields": [
            {"t": "textarea", "id": "notes", "label": "Notes or Questions for the Provider",
             "ph": "Is there anything else you'd like us to know before your consultation?"},
        ]},
    ],
}


# --------------------------------------------------------------------------
# New patient intake
# --------------------------------------------------------------------------

INTAKE_FORM = {
    "slug": "new-patient",
    "name": "New Patient Intake Form",
    "plain_name": "New Patient Intake Form",
    "lede": "Please complete this form before your first visit. All information is kept confidential.",
    "title": "New Patient Intake Form | RegenOrtho Palm Beach",
    "desc": ("Complete your RegenOrtho Palm Beach new patient intake form before your first visit "
             "— private, and filled out entirely in your own browser."),
    "ack": ACK_TEXT_INTAKE,
    "card": {
        "for_who": "Every new patient, before your first appointment with us.",
        "covers": ["Contact, emergency contact &amp; insurance",
                   "What brings you in, and what you want to get back to",
                   "Medical &amp; surgical history",
                   "Medications, supplements &amp; allergies"],
        "icon": '<path d="M7 3.8h10a1.2 1.2 0 0 1 1.2 1.2v14a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 19V5A1.2 1.2 0 0 1 7 3.8Z"/><path d="M9.2 9.4h5.6M9.2 12.6h5.6M9.2 15.8h3.2"/>',
    },
    "sections": [
        {"n": "01", "title": "Patient Information", "fields": [
            {"t": "text", "id": "full-name", "label": "Full Name", "req": True, "ac": "name", "w": "half"},
            {"t": "text", "id": "preferred-name", "label": "Preferred Name", "ac": "nickname", "w": "half"},
            {"t": "date", "id": "dob", "label": "Date of Birth", "req": True, "ac": "bday", "w": "half"},
            {"t": "select", "id": "sex", "label": "Sex", "w": "half",
             "opts": ["Female", "Male", "Prefer not to say"]},
            {"t": "text", "id": "address", "label": "Street Address", "ac": "street-address"},
            {"t": "text", "id": "city", "label": "City", "ac": "address-level2", "w": "half"},
            {"t": "text", "id": "state", "label": "State", "ac": "address-level1", "w": "half"},
            {"t": "text", "id": "zip", "label": "ZIP Code", "ac": "postal-code", "w": "half"},
            {"t": "tel", "id": "phone", "label": "Phone", "req": True, "ac": "tel", "w": "half"},
            {"t": "email", "id": "email", "label": "Email", "req": True, "ac": "email", "w": "half"},
            {"t": "select", "id": "contact-pref", "label": "Preferred Contact Method", "w": "half",
             "opts": ["Phone call", "Text message", "Email"]},
        ]},
        {"n": "02", "title": "Emergency Contact", "fields": [
            {"t": "text", "id": "ec-name", "label": "Contact Name", "w": "half"},
            {"t": "text", "id": "ec-relationship", "label": "Relationship", "w": "half"},
            {"t": "tel", "id": "ec-phone", "label": "Contact Phone", "w": "half"},
        ]},
        {"n": "03", "title": "Insurance &amp; Payment", "fields": [
            {"t": "yesno", "id": "using-insurance", "label": "Do you plan to use insurance for this visit?",
             "hint": "We work with most major providers and also offer concierge and direct-pay options."},
            {"t": "text", "id": "ins-carrier", "label": "Insurance Carrier", "w": "half"},
            {"t": "text", "id": "ins-member-id", "label": "Member ID", "w": "half"},
            {"t": "text", "id": "ins-group", "label": "Group Number", "w": "half"},
            {"t": "text", "id": "ins-policyholder",
             "label": "Policyholder Name", "hint": "Only if someone other than you", "w": "half"},
            {"t": "yesno", "id": "workers-comp",
             "label": "Is this visit related to a work injury or auto accident?",
             "follow": {"t": "text", "id": "workers-comp-detail",
                        "label": "If yes, claim number and date of injury"}},
        ]},
        {"n": "04", "title": "Reason for Your Visit", "fields": [
            {"t": "textarea", "id": "chief-complaint", "label": "What brings you in today?", "req": True,
             "ph": "Describe your main concern in your own words"},
            {"t": "checks", "id": "areas", "label": "Area(s) of concern",
             "hint": "Select all that apply.",
             "opts": ["Knee", "Shoulder", "Hip", "Foot &amp; ankle", "Hand &amp; wrist", "Elbow",
                      "Back or spine", "Legs / veins", "Nerves (numbness, burning)",
                      "Whole-body / wellness"]},
            {"t": "select", "id": "onset", "label": "When did it start?", "w": "half",
             "opts": ["Within the past week", "1–4 weeks ago", "1–3 months ago",
                      "3–12 months ago", "More than a year ago"]},
            {"t": "select", "id": "pain-level", "label": "Current pain level (0 = none, 10 = worst)",
             "w": "half",
             "opts": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]},
            {"t": "text", "id": "worse-with", "label": "What makes it worse?", "w": "half"},
            {"t": "text", "id": "better-with", "label": "What makes it better?", "w": "half"},
            {"t": "yesno", "id": "imaging", "label": "Have you had imaging for this (X-ray, MRI, CT, ultrasound)?",
             "follow": {"t": "text", "id": "imaging-detail",
                        "label": "If yes, what kind, when, and where"}},
            {"t": "yesno", "id": "prior-treatment",
             "label": "Have you already been treated for this concern?",
             "follow": {"t": "text", "id": "prior-treatment-detail",
                        "label": "If yes, what was tried (therapy, injections, surgery, medication)"}},
            {"t": "text", "id": "referring-physician", "label": "Referring Physician",
             "hint": "If you were referred to us. A referral is not required.", "w": "half"},
        ]},
        {"n": "05", "title": "Medical History", "grid": True,
         "intro": "Do you have, or have you ever been diagnosed with, any of the following?",
         "fields": [
            {"t": "yesno", "id": "ih-arthritis", "label": "Arthritis"},
            {"t": "yesno", "id": "ih-osteoporosis", "label": "Osteoporosis or low bone density"},
            {"t": "yesno", "id": "ih-diabetes", "label": "Diabetes (Type 1 or Type 2)",
             "follow": {"t": "text", "id": "ih-diabetes-detail",
                        "label": "If yes, type and current management"}},
            {"t": "yesno", "id": "ih-cardiac", "label": "Heart disease or heart condition"},
            {"t": "yesno", "id": "ih-hypertension", "label": "High blood pressure",
             "follow": {"t": "text", "id": "ih-hypertension-detail",
                        "label": "If yes, current medications"}},
            {"t": "yesno", "id": "ih-clots", "label": "Blood clots, DVT, or pulmonary embolism"},
            {"t": "yesno", "id": "ih-bleeding", "label": "Bleeding disorder or blood thinner use",
             "follow": {"t": "text", "id": "ih-bleeding-detail", "label": "If yes, please specify"}},
            {"t": "yesno", "id": "ih-kidney", "label": "Kidney disease"},
            {"t": "yesno", "id": "ih-liver", "label": "Liver disease"},
            {"t": "yesno", "id": "ih-thyroid", "label": "Thyroid disorder"},
            {"t": "yesno", "id": "ih-autoimmune", "label": "Autoimmune condition",
             "follow": {"t": "text", "id": "ih-autoimmune-detail", "label": "If yes, please specify"}},
            {"t": "yesno", "id": "ih-neuropathy", "label": "Neuropathy or nerve damage"},
            {"t": "yesno", "id": "ih-cancer", "label": "Cancer (active or in remission)",
             "follow": {"t": "text", "id": "ih-cancer-detail", "label": "If yes, type and when"}},
            {"t": "yesno", "id": "ih-infection", "label": "Active infection anywhere in the body"},
            {"t": "yesno", "id": "ih-anesthesia", "label": "Problems with anesthesia or sedation",
             "follow": {"t": "text", "id": "ih-anesthesia-detail", "label": "If yes, please describe"}},
            {"t": "yesno", "id": "ih-pregnancy", "label": "Pregnant, planning pregnancy, or nursing"},
         ]},
        {"n": "06", "title": "Surgical History", "fields": [
            {"t": "textarea", "id": "surgeries", "label": "Previous Surgeries",
             "ph": "List any surgeries and approximate dates"},
            {"t": "textarea", "id": "hospitalizations", "label": "Hospitalizations or Major Injuries",
             "ph": "List any hospitalizations or significant injuries and approximate dates"},
        ]},
        {"n": "07", "title": "Medications &amp; Allergies", "fields": list(MEDS_ALLERGIES)},
        {"n": "08", "title": "Lifestyle &amp; Activity", "fields": [
            {"t": "text", "id": "occupation", "label": "Occupation", "w": "half"},
            {"t": "select", "id": "activity-level", "label": "Current Activity Level", "w": "half",
             "opts": ["Sedentary", "Lightly active", "Moderately active",
                      "Very active", "Competitive athlete"]},
            {"t": "text", "id": "activities", "label": "Sports or activities you want to get back to",
             "hint": "This helps us build the right plan for you."},
            {"t": "yesno", "id": "tobacco", "label": "Tobacco or nicotine use",
             "follow": {"t": "text", "id": "tobacco-detail", "label": "If yes, type and frequency"}},
            {"t": "yesno", "id": "alcohol", "label": "Alcohol use (more than 7 drinks per week)",
             "follow": {"t": "text", "id": "alcohol-detail",
                        "label": "If yes, approximate drinks per week"}},
        ]},
        {"n": "09", "title": "Additional Information", "fields": [
            {"t": "select", "id": "referral-source", "label": "How did you hear about us?", "w": "half",
             "opts": ["Google search", "Referred by my physician", "Referred by a friend or family member",
                      "Instagram", "Drove by / saw the office", "Insurance directory", "Other"]},
            {"t": "textarea", "id": "notes", "label": "Notes or Questions for the Provider",
             "ph": "Is there anything else you'd like us to know before your visit?"},
        ]},
    ],
}

# --------------------------------------------------------------------------
# IV therapy informed consent
# --------------------------------------------------------------------------

IV_CONSENT_TEXT = (
    "I understand that IV (intravenous) therapy involves the delivery of fluids, vitamins, "
    "minerals, and/or other additives directly into my bloodstream through a needle placed in "
    "a vein. I understand the purpose of my infusion is to support hydration, nutrient "
    "repletion, and general wellness, and that it is not intended to diagnose, treat, cure, or "
    "prevent any disease.\n\n"
    "I understand that, as with any procedure involving needle placement and infused "
    "substances, there are potential risks and side effects, including but not limited to: "
    "pain, bruising, or bleeding at the injection site; infiltration or extravasation (fluid "
    "leaking into surrounding tissue); vein irritation or phlebitis; infection at the injection "
    "site; lightheadedness, dizziness, or fainting; nausea; a metallic taste during infusion; "
    "and allergic reaction, which in rare cases can be severe. I understand that patients with "
    "certain heart, kidney, or other medical conditions may be at higher risk of complications "
    "such as fluid overload, and that I am responsible for disclosing my full medical history "
    "in the screening section of this form.\n\n"
    "I understand that alternatives to IV therapy include oral hydration and oral vitamin or "
    "mineral supplementation, and that I have had the opportunity to discuss these alternatives "
    "with the clinical team before treatment.\n\n"
    "I understand a member of the clinical team will review my health screening answers and "
    "current medications before my infusion, and that treatment may be modified, delayed, or "
    "declined based on that review. I understand I may stop my infusion at any time by notifying "
    "the clinician monitoring my visit.\n\n"
    "I certify that the information I have provided is accurate and complete to the best of my "
    "knowledge, and I voluntarily consent to receive IV therapy at RegenOrtho Palm Beach."
)

IV_CONSENT_FORM = {
    "slug": "iv-therapy-consent",
    "name": "IV Therapy Informed Consent",
    "plain_name": "IV Therapy Informed Consent",
    "lede": "Please review and complete this consent before your IV infusion visit. All information is kept confidential.",
    "title": "IV Therapy Informed Consent | RegenOrtho Palm Beach",
    "desc": ("Review and complete the RegenOrtho Palm Beach IV therapy informed consent before your "
             "infusion visit — private, filled out entirely in your browser."),
    "ack": IV_CONSENT_TEXT,
    "card": {
        "for_who": "Anyone receiving IV or infusion therapy in our wellness lounge.",
        "covers": ["What IV therapy involves, and its risks &amp; alternatives",
                   "A short health screening for infusion safety",
                   "Medications, supplements &amp; allergies",
                   "Your signed consent to treatment"],
        "icon": '<path d="M12 3.5c3 4 6 8 6 11.5a6 6 0 0 1-12 0c0-3.5 3-7.5 6-11.5Z"/><path d="M9.4 15.2a2.6 2.6 0 0 0 2.6 2.6"/>',
    },
    "sections": [
        {"n": "01", "title": "Patient Information", "fields": [
            {"t": "text", "id": "full-name", "label": "Full Name", "req": True, "ac": "name", "w": "half"},
            {"t": "date", "id": "dob", "label": "Date of Birth", "req": True, "ac": "bday", "w": "half"},
            {"t": "tel", "id": "phone", "label": "Phone", "ac": "tel", "w": "half"},
            {"t": "email", "id": "email", "label": "Email", "req": True, "ac": "email", "w": "half"},
            # opts populated at build time from build.py's IV_MENU (build_forms()) so this
            # never drifts out of sync with the actual drip menu on iv-therapy.html.
            {"t": "select", "id": "iv-service", "label": "Which IV infusion are you receiving today?",
             "req": True, "hint": "Confirm with the front desk if you're not sure.", "opts": []},
        ]},
        {"n": "02", "title": "Health Screening", "grid": True,
         "intro": "This screening helps our clinical team confirm IV therapy is appropriate for you today.",
         "fields": [
            {"t": "yesno", "id": "iv-pregnant", "label": "Are you pregnant, planning pregnancy, or nursing?"},
            {"t": "yesno", "id": "iv-kidney", "label": "Do you have kidney disease or are you on dialysis?"},
            {"t": "yesno", "id": "iv-heart",
             "label": "Do you have heart disease, congestive heart failure, or a fluid restriction?"},
            {"t": "yesno", "id": "iv-g6pd",
             "label": "Do you have G6PD deficiency?",
             "hint": "Relevant for high-dose vitamin C infusions."},
            {"t": "yesno", "id": "iv-allergy-additive",
             "label": "Do you have a known allergy to any vitamins, minerals, or IV additives?",
             "follow": {"t": "text", "id": "iv-allergy-additive-detail", "label": "If yes, please specify"}},
            {"t": "yesno", "id": "iv-needle-history",
             "label": "Have you ever fainted, felt dizzy, or had trouble with IV access or blood draws?"},
            {"t": "yesno", "id": "iv-bleeding",
             "label": "Do you have a bleeding disorder or take blood thinners?",
             "follow": {"t": "text", "id": "iv-bleeding-detail", "label": "If yes, please specify"}},
            {"t": "yesno", "id": "iv-recent-illness",
             "label": "Do you currently have a fever, infection, or feel acutely unwell?"},
         ]},
        {"n": "03", "title": "Medications &amp; Allergies", "fields": list(MEDS_ALLERGIES)},
        {"n": "04", "title": "Signature", "fields": [
            {"t": "text", "id": "signature", "label": "Signature (type your full legal name)", "req": True,
             "hint": "Typing your name here serves as your signature on this form."},
            {"t": "date", "id": "signature-date", "label": "Date", "req": True, "w": "half"},
        ]},
    ],
}


FORMS = [INTAKE_FORM, GLP_FORM, IV_CONSENT_FORM]
