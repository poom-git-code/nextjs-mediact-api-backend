export const toLocalISOString = (date: Date | string): string => {
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${d.getMilliseconds().toString().padStart(3, '0')}Z`;
};
