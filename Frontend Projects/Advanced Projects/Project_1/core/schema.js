export const schema = {
  steps: [
    {
      id: "personal",
      name: "Personal Information",
      fields: [
        {
          name: "name",
          type: "text",
          label: "Name",
          placeholder: "Enter your name",
          required: true,
          validation: "",
        },
        {
          name: "email",
          type: "email",
          label: "Email",
          placeholder: "Enter your email",
          required: true,
          validation: "",
        },
        {
          name: "phone",
          type: "number",
          label: "Phone",
          placeholder: "Enter your phone",
          required: true,
          validation: "",
        },
      ],
    },
    {
      id: "address",
      name: "Address Information",
      fields: [
        {
          name: "address",
          type: "text",
          label: "Address",
          placeholder: "Enter your address",
          required: true,
          validation: "",
        },
        {
          name: "city",
          type: "text",
          label: "City",
          placeholder: "Enter your city",
          required: true,
          validation: "",
        },
        {
          name: "state",
          type: "text",
          label: "State",
          placeholder: "Enter your state",
          required: true,
          validation: "",
        },
        {
          name: "zip",
          type: "number",
          label: "Zip",
          placeholder: "Enter your zip",
          required: true,
          validation: "",
        },
      ],
    },

    {
      id: "education",
      name: "Education Information",
      fields: [
        {
          name: "degree",
          type: "text",
          label: "Degree",
          placeholder: "Enter your degree",
          required: true,
          validation: "",
        },
        {
          name: "school",
          type: "text",
          label: "School",
          placeholder: "Enter your school",
          required: true,
          validation: "",
        },
        {
          name: "graduation_year",
          type: "number",
          label: "Graduation Year",
          placeholder: "Enter your graduation year",
          required: true,
          validation: "",
        },
      ],
    },
    {
      id: "skills",
      name: "Skills Information",
      fields: [
        {
          name: "skills",
          type: "text",
          label: "Skills",
          placeholder: "Enter your skills",
          required: true,
          validation: "",
        },
      ],
    },
    {
      id: "projects",
      name: "Projects Information",
      fields: [
        {
          name: "projects",
          type: "text",
          label: "Projects",
          placeholder: "Enter your projects",
          required: true,
          validation: "",
        },
      ],
    },
    {
      id: "references",
      name: "References Information",
      fields: [
        {
          name: "references",
          type: "text",
          label: "References",
          placeholder: "Enter your references",
          required: true,
          validation: "",
        },
      ],
    },

    {
      id: "cover-letter",
      name: "Cover Letter Information",
      fields: [
        {
          name: "cover_letter",
          type: "text",
          label: "Cover Letter",
          placeholder: "Enter your cover letter",
          required: true,
          validation: "",
        },
      ],
    },
    {
      id: "portfolio",
      name: "Portfolio Information",
      fields: [
        {
          name: "portfolio",
          type: "text",
          label: "Portfolio",
          placeholder: "Enter your portfolio",
          required: true,
          validation: "",
        },
      ],
    },
    {
      id: "certifications",
      name: "Certifications Information",
      fields: [
        {
          name: "certifications",
          type: "text",
          label: "Certifications",
          placeholder: "Enter your certifications",
          required: true,
          validation: "",
        },
      ],
    },
  ],
};
