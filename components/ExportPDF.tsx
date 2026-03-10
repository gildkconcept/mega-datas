'use client'

import { MemberWithCreator } from '@/types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ExportPDFProps {
  members: MemberWithCreator[]
  fileName?: string
}

export default function ExportPDF({ members, fileName = 'membres' }: ExportPDFProps) {
  const generatePDF = () => {
    try {
      console.log('Génération PDF - membres:', members.length)
      
      // Créer un nouveau document PDF
      const doc = new jsPDF({
        orientation: 'landscape', // Paysage pour plus de colonnes
        unit: 'mm',
        format: 'a4'
      })

      // Titre du document
      doc.setFontSize(18)
      doc.setTextColor(0, 51, 102) // Bleu foncé
      doc.text('MEGA-DATA - Liste des membres', 14, 15)
      
      // Date d'export
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      const date = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      doc.text(`Exporté le ${date}`, 14, 22)
      
      // Statistiques
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text(`Total des membres: ${members.length}`, 14, 29)

      // Préparer les données pour le tableau
      const tableColumn = [
        'N°',
        'Nom',
        'Prénom',
        'Téléphone',
        'Ville',
        'Commune',
        'Quartier',
        'Enregistré par',
        'Branche',
        'Date'
      ]

      const tableRows = members.map((member, index) => [
        (index + 1).toString(),
        member.nom || '',
        member.prenom || '',
        member.telephone || '',
        member.ville || '',
        member.commune || '',
        member.quartier || '',
        member.creator?.username || 'N/A',
        member.creator?.branche || 'N/A',
        new Date(member.created_at).toLocaleDateString('fr-FR')
      ])

      // Générer le tableau
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 10 }, // N°
          1: { cellWidth: 25 }, // Nom
          2: { cellWidth: 25 }, // Prénom
          3: { cellWidth: 25 }, // Téléphone
          4: { cellWidth: 25 }, // Ville
          5: { cellWidth: 25 }, // Commune
          6: { cellWidth: 25 }, // Quartier
          7: { cellWidth: 25 }, // Enregistré par
          8: { cellWidth: 30 }, // Branche
          9: { cellWidth: 20 }, // Date
        },
        didDrawPage: (data) => {
          // Ajouter un pied de page
          doc.setFontSize(8)
          doc.setTextColor(150, 150, 150)
          doc.text(
            `Page ${doc.getCurrentPageInfo().pageNumber}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10
          )
        }
      })

      // Sauvegarder le PDF
      doc.save(`${fileName}_${date.replace(/[/: ]/g, '-')}.pdf`)
      
      console.log('PDF généré avec succès')
      
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('Erreur lors de la génération du PDF')
    }
  }

  return (
    <button
      onClick={generatePDF}
      disabled={members.length === 0}
      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title="Exporter la liste des membres en PDF"
    >
      <svg 
        className="w-5 h-5 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      Exporter PDF
    </button>
  )
}