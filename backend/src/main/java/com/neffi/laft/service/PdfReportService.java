package com.neffi.laft.service;

import com.neffi.laft.model.RestrictiveListEntry;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class PdfReportService {

    private static final float MARGIN = 50;
    private static final float PAGE_WIDTH = PDRectangle.LETTER.getWidth();
    private static final float CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private static final String[] TABLE_HEADERS = {"Documento", "Nombre", "Lista", "Fuente", "Coincidencia"};
    private static final float[] COL_WIDTHS = {90, 140, 100, 80, 80};
    private static final float ROW_HEIGHT = 18;

    public byte[] generateValidationReport(String documentNumber, String personType,
                                            String fullName, String userName,
                                            List<RestrictiveListEntry> matches) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);

            ContentStreamHolder holder = new ContentStreamHolder(new PDPageContentStream(document, page));
            float y = page.getMediaBox().getHeight() - MARGIN;

            y = drawHeader(holder.cs, y);
            y = drawSeparator(holder.cs, y);
            y = drawValidationInfo(holder.cs, y, documentNumber, personType, fullName, userName);
            y = drawSeparator(holder.cs, y);
            y = drawResultSection(holder, y, matches, document);

            holder.cs.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    private static class ContentStreamHolder {
        PDPageContentStream cs;
        ContentStreamHolder(PDPageContentStream cs) { this.cs = cs; }
    }

    private float drawHeader(PDPageContentStream cs, float y) throws IOException {
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA_BOLD, 18);
        cs.newLineAtOffset(MARGIN, y);
        cs.showText("NEFFI LAFT");
        cs.endText();
        y -= 20;

        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 10);
        cs.newLineAtOffset(MARGIN, y);
        cs.showText("Informe de Validacion en Listas Restrictivas");
        cs.endText();
        y -= 25;

        return y;
    }

    private float drawSeparator(PDPageContentStream cs, float y) throws IOException {
        y -= 5;
        cs.setLineWidth(1f);
        cs.setStrokingColor(200 / 255f, 200 / 255f, 200 / 255f);
        cs.moveTo(MARGIN, y);
        cs.lineTo(PAGE_WIDTH - MARGIN, y);
        cs.stroke();
        cs.setStrokingColor(0f, 0f, 0f);
        y -= 15;
        return y;
    }

    private float drawValidationInfo(PDPageContentStream cs, float y,
                                      String documentNumber, String personType,
                                      String fullName, String userName) throws IOException {
        String dateTime = LocalDateTime.now().format(DATE_FMT);

        y = drawLabelValue(cs, y, "Fecha y Hora:", dateTime);
        y = drawLabelValue(cs, y, "Realizado por:", sanitize(userName != null ? userName : "Usuario del sistema"));
        y -= 10;

        String personTypeLabel = "juridica".equalsIgnoreCase(personType) ? "Persona Juridica" : "Persona Natural";
        y = drawLabelValue(cs, y, "Tipo de Persona:", personTypeLabel);
        y = drawLabelValue(cs, y, "Numero de Documento:", sanitize(documentNumber != null ? documentNumber : "No proporcionado"));
        y = drawLabelValue(cs, y, "Nombre / Razon Social:", sanitize(fullName != null && !fullName.isBlank() ? fullName : "No proporcionado"));

        return y;
    }

    private float drawLabelValue(PDPageContentStream cs, float y, String label, String value) throws IOException {
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA_BOLD, 10);
        cs.newLineAtOffset(MARGIN, y);
        cs.showText(label);
        cs.endText();

        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 10);
        cs.newLineAtOffset(MARGIN + 160, y);
        cs.showText(value);
        cs.endText();

        return y - 16;
    }

    private float drawResultSection(ContentStreamHolder holder, float y,
                                     List<RestrictiveListEntry> matches,
                                     PDDocument document) throws IOException {
        boolean hasMatches = matches != null && !matches.isEmpty();

        holder.cs.beginText();
        holder.cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
        holder.cs.newLineAtOffset(MARGIN, y);
        holder.cs.showText("Resultado de la Validacion");
        holder.cs.endText();
        y -= 20;

        if (hasMatches) {
            holder.cs.setNonStrokingColor(220 / 255f, 38 / 255f, 38 / 255f);
            holder.cs.beginText();
            holder.cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
            holder.cs.newLineAtOffset(MARGIN, y);
            holder.cs.showText("ALERTA - Se encontraron " + matches.size() + " coincidencia(s) en listas restrictivas");
            holder.cs.endText();
            holder.cs.setNonStrokingColor(0f, 0f, 0f);
            y -= 18;

            holder.cs.beginText();
            holder.cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
            holder.cs.newLineAtOffset(MARGIN, y);
            holder.cs.showText("Permite Vinculacion: NO");
            holder.cs.endText();
            y -= 25;

            y = drawMatchesTable(holder, y, matches, document);
        } else {
            holder.cs.setNonStrokingColor(22 / 255f, 163 / 255f, 74 / 255f);
            holder.cs.beginText();
            holder.cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
            holder.cs.newLineAtOffset(MARGIN, y);
            holder.cs.showText("Sin coincidencias en listas restrictivas");
            holder.cs.endText();
            y -= 18;

            holder.cs.beginText();
            holder.cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
            holder.cs.newLineAtOffset(MARGIN, y);
            holder.cs.showText("Permite Vinculacion: SI");
            holder.cs.endText();
            holder.cs.setNonStrokingColor(0f, 0f, 0f);
            y -= 20;
        }

        return y;
    }

    private float drawTableHeaders(PDPageContentStream cs, float y) throws IOException {
        cs.setNonStrokingColor(240 / 255f, 240 / 255f, 240 / 255f);
        cs.addRect(MARGIN, y - ROW_HEIGHT + 4, CONTENT_WIDTH, ROW_HEIGHT);
        cs.fill();
        cs.setNonStrokingColor(0f, 0f, 0f);

        float x = MARGIN;
        for (int i = 0; i < TABLE_HEADERS.length; i++) {
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_BOLD, 8);
            cs.newLineAtOffset(x + 4, y - 8);
            cs.showText(TABLE_HEADERS[i]);
            cs.endText();
            x += COL_WIDTHS[i];
        }
        return y - ROW_HEIGHT;
    }

    private float drawMatchesTable(ContentStreamHolder holder, float y, List<RestrictiveListEntry> matches,
                                    PDDocument document) throws IOException {
        y = drawTableHeaders(holder.cs, y);

        for (RestrictiveListEntry match : matches) {
            if (y < MARGIN + 40) {
                holder.cs.close();
                PDPage newPage = new PDPage(PDRectangle.LETTER);
                document.addPage(newPage);
                holder.cs = new PDPageContentStream(document, newPage);
                y = newPage.getMediaBox().getHeight() - MARGIN;
                y = drawTableHeaders(holder.cs, y);
            }

            holder.cs.setLineWidth(0.5f);
            holder.cs.setStrokingColor(220 / 255f, 220 / 255f, 220 / 255f);
            holder.cs.moveTo(MARGIN, y + 4);
            holder.cs.lineTo(PAGE_WIDTH - MARGIN, y + 4);
            holder.cs.stroke();
            holder.cs.setStrokingColor(0f, 0f, 0f);

            float x = MARGIN;
            String[] values = {
                truncate(sanitize(match.getDocumentNumber()), 14),
                truncate(sanitize(match.getFullName()), 22),
                truncate(sanitize(match.getListName()), 16),
                truncate(sanitize(match.getListSource()), 12),
                truncate(sanitize(match.getMatchType()), 12)
            };

            for (int i = 0; i < values.length; i++) {
                holder.cs.beginText();
                holder.cs.setFont(PDType1Font.HELVETICA, 8);
                holder.cs.newLineAtOffset(x + 4, y - 8);
                holder.cs.showText(values[i]);
                holder.cs.endText();
                x += COL_WIDTHS[i];
            }
            y -= ROW_HEIGHT;
        }

        return y;
    }

    private String sanitize(String text) {
        if (text == null) return "";
        return text.replaceAll("[\\p{Cntrl}&&[^\t]]", "").replace("\t", " ");
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() > maxLen ? text.substring(0, maxLen - 2) + ".." : text;
    }
}
