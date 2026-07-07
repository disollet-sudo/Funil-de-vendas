import { Lead, StatusFunil } from "./types";

/**
 * Removes all non-numeric characters from a string
 */
export function onlyNumbers(val: string): string {
  return val.replace(/\D/g, "");
}

/**
 * Formats a raw number string into CNPJ: XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(cnpj: string): string {
  const nums = onlyNumbers(cnpj);
  if (nums.length !== 14) return cnpj;
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12, 14)}`;
}

/**
 * Formats a raw number string into CEP: XXXXX-XXX
 */
export function formatCEP(cep: string): string {
  const nums = onlyNumbers(cep);
  if (nums.length !== 8) return cep;
  return `${nums.slice(0, 5)}-${nums.slice(5, 8)}`;
}

/**
 * Formats a telephone string into (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */
export function formatPhone(phone: string): string {
  const nums = onlyNumbers(phone);
  if (nums.length === 11) {
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
  } else if (nums.length === 10) {
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6, 10)}`;
  }
  return phone;
}

/**
 * Calculates the contact status of a lead based on next contact date and current time
 * @returns 'red' | 'yellow' | 'green' | 'none'
 */
export function getLeadStatus(lead: Lead, currentTimeStr: string = new Date().toISOString()): "red" | "yellow" | "green" | "none" {
  // If the lead is won or lost, follow-up alerts are not applicable
  if (lead.statusFunil === StatusFunil.CLIENTE_GANHO || lead.statusFunil === StatusFunil.PERDIDO) {
    return "none";
  }

  if (!lead.dataProximoContato) {
    return "none";
  }

  const nextDate = new Date(lead.dataProximoContato);
  const currentDate = new Date(currentTimeStr);

  // Check if today (same local calendar day)
  const isToday = nextDate.getFullYear() === currentDate.getFullYear() &&
                  nextDate.getMonth() === currentDate.getMonth() &&
                  nextDate.getDate() === currentDate.getDate();

  if (nextDate < currentDate) {
    return "red"; // Overdue
  } else if (isToday) {
    return "yellow"; // Today
  } else {
    return "green"; // Future
  }
}

/**
 * Formats a date string to a Brazilian human-readable date
 */
export function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "Sem data";
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Data inválida";

  const pad = (n: number) => n.toString().padStart(2, "0");
  
  const day = pad(date.getDate());
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${day} ${month} ${year}, às ${hours}:${minutes}`;
}

/**
 * Creates an elegant mailto link
 */
export function getMailtoLink(email: string, companyName: string): string {
  const subject = encodeURIComponent(`A/C Departamento Comercial - ${companyName}`);
  return `mailto:${email}?subject=${subject}`;
}

/**
 * Creates a WhatsApp click-to-chat link
 */
export function getWhatsAppLink(phone: string, companyName: string): string {
  const nums = onlyNumbers(phone);
  const dddAndPhone = nums.startsWith("55") ? nums : `55${nums}`;
  const text = encodeURIComponent(`Olá! Gostaria de falar com o responsável comercial da ${companyName}.`);
  return `https://wa.me/${dddAndPhone}?text=${text}`;
}

/**
 * Creates a telephone call trigger link
 */
export function getCallLink(phone: string): string {
  const nums = onlyNumbers(phone);
  return `tel:${nums}`;
}
