import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Invoice = () => {
  const invoiceRef = useRef();

  const downloadInvoice = async () => {
    const element = invoiceRef.current;
    const canvas = await html2canvas(element);
    const dataURL = canvas.toDataURL('image/png');
    const pdf = new jsPDF();

    const imgWidth = 190; // Set according to your design
    const pageHeight = pdf.internal.pageSize.height;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(dataURL, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(dataURL, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('invoice.pdf');
  };

  return (
    <div className="p-5">
      <div ref={invoiceRef} className="border p-5 bg-white shadow-lg">
        <h1 className="text-2xl font-bold">Invoice</h1>
        <p>Date: {new Date().toLocaleDateString()}</p>
        <p>Customer Name: John Doe</p>
        <p>Amount: $100</p>
        {/* Add more details here as needed */}
      </div>
      <button
        onClick={downloadInvoice}
        className="mt-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Download Invoice
      </button>
    </div>
  );
};

export default Invoice;
