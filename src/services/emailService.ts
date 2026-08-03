import { COMPANY_INFO } from '../data/companyData';

export interface EmailPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  projectCategory?: string;
  budgetRange?: string;
  timeline?: string;
  description: string;
  selectedModules?: string[];
  source?: string;
}

/**
 * Submits form directly via hidden DOM form and iframe to bypass any CORS/Fetch restrictions
 */
export function submitHiddenFormEmail(payload: EmailPayload): void {
  if (typeof document === 'undefined') return;

  const recipientEmail = COMPANY_INFO.contactEmail || 'ohmvedatechnologies@gmail.com';
  const emailSubject = payload.subject || `New Inquiry from ${payload.name} (${payload.source || 'Website'})`;

  try {
    // 1. Ensure hidden target iframe exists
    let iframe = document.getElementById('hidden_email_iframe') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'hidden_email_iframe';
      iframe.name = 'hidden_email_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // 2. Create hidden form element
    const form = document.createElement('form');
    form.action = `https://formsubmit.co/${recipientEmail}`;
    form.method = 'POST';
    form.target = 'hidden_email_iframe';
    form.style.display = 'none';

    const fields: Record<string, string> = {
      name: payload.name,
      email: payload.email,
      _replyto: payload.email,
      phone: payload.phone || 'Not provided',
      company: payload.company || 'Not provided',
      _subject: emailSubject,
      _captcha: 'false',
      _template: 'box',
      Project_Category: payload.projectCategory || 'General Inquiry',
      Budget_Range: payload.budgetRange || 'Not specified',
      Timeline: payload.timeline || 'Flexible',
      Selected_Modules: payload.selectedModules && payload.selectedModules.length > 0 ? payload.selectedModules.join(', ') : 'None',
      Inquiry_Source: payload.source || 'Website Form',
      Description: payload.description || 'No description provided.',
      message: `
===================================================
OHMVEDA TECHNOLOGIES - NEW INQUIRY PROPOSAL BRIEF
===================================================

Client Name: ${payload.name}
Email Address: ${payload.email}
Phone Number: ${payload.phone || 'Not provided'}
Company: ${payload.company || 'Not provided'}
Inquiry Source: ${payload.source || 'Website'}

Category: ${payload.projectCategory || 'General Inquiry'}
Budget Range: ${payload.budgetRange || 'Not specified'}
Timeline: ${payload.timeline || 'Flexible'}
${payload.selectedModules && payload.selectedModules.length > 0 ? `Modules: ${payload.selectedModules.join(', ')}\n` : ''}

Description / Scope:
${payload.description}
      `.trim(),
    };

    Object.entries(fields).forEach(([key, val]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = val;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      if (form.parentNode) {
        form.parentNode.removeChild(form);
      }
    }, 3000);
  } catch (err) {
    console.warn('Hidden DOM email submit error:', err);
  }
}

/**
 * Sends automated email notification to engineering team via background API endpoints
 */
export async function sendInquiryNotificationEmail(payload: EmailPayload): Promise<{ success: boolean; message: string }> {
  const recipientEmail = COMPANY_INFO.contactEmail || 'ohmvedatechnologies@gmail.com';
  const emailSubject = payload.subject || `New Inquiry from ${payload.name} (${payload.source || 'Website'})`;

  const formattedBody = `
===================================================
OHMVEDA TECHNOLOGIES - NEW WEBSITE INQUIRY BRIEF
===================================================

Client Name: ${payload.name}
Email Address: ${payload.email}
Phone Number: ${payload.phone || 'Not provided'}
Company / Org: ${payload.company || 'Not provided'}
Source Form: ${payload.source || 'Website Inquiry'}

--- PROJECT SPECIFICATIONS ---
Category: ${payload.projectCategory || 'General Inquiry'}
Budget Range: ${payload.budgetRange || 'Not specified'}
Timeline: ${payload.timeline || 'Flexible'}

${payload.selectedModules && payload.selectedModules.length > 0 ? `Configured Modules:\n- ${payload.selectedModules.join('\n- ')}\n` : ''}
--- DESCRIPTION / REQUIREMENTS ---
${payload.description}

===================================================
Timestamp: ${new Date().toLocaleString()}
Recipient Inbox: ${recipientEmail}
===================================================
  `.trim();

  // Method 1: FormSubmit AJAX via FormData with box template
  try {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    formData.append('_replyto', payload.email);
    formData.append('phone', payload.phone || 'Not provided');
    formData.append('company', payload.company || 'Not provided');
    formData.append('project_category', payload.projectCategory || 'General Inquiry');
    formData.append('budget_range', payload.budgetRange || 'Not specified');
    formData.append('timeline', payload.timeline || 'Flexible');
    if (payload.selectedModules && payload.selectedModules.length > 0) {
      formData.append('configured_modules', payload.selectedModules.join(', '));
    }
    formData.append('_subject', emailSubject);
    formData.append('_template', 'box');
    formData.append('message', formattedBody);
    formData.append('_captcha', 'false');

    const formSubmitUrl = `https://formsubmit.co/ajax/${recipientEmail}`;
    const response = await fetch(formSubmitUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success === 'true' || data.success === true || (data.message && data.message.toLowerCase().includes('success'))) {
        return { success: true, message: 'Email sent' };
      }
    }
  } catch (err) {
    console.warn('FormSubmit FormData API warning:', err);
  }

  // Fallback to hidden form submission if fetch failed
  submitHiddenFormEmail(payload);

  return { 
    success: true, 
    message: 'Email sent' 
  };
}

/**
 * Generates a direct Web Gmail compose link
 */
export function getGmailComposeUrl(recipient: string, subject: string, body: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Generates standard mailto link
 */
export function getMailtoUrl(recipient: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
