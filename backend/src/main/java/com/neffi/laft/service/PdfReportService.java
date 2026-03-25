package com.neffi.laft.service;

import com.neffi.laft.dto.RestrictiveListEntry;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class PdfReportService {

    private static final float MARGIN = 50;
    private static final float PAGE_WIDTH = PDRectangle.LETTER.getWidth();
    private static final float CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    private static final String LOGO_RESOURCE_PATH = "static/img/logo-af.png";
    private static final float LOGO_WIDTH = 96f;
    private static final float LOGO_HEIGHT = 39f;
    private static final float LOGO_TOP_OFFSET = 1f;
    private static final float HEADER_TOP_RAISE = 10f;
    private static final float HEADER_TEXT_X = MARGIN;
    private static final float HEADER_LOGO_X = PAGE_WIDTH - MARGIN - LOGO_WIDTH;
    private static final String REPORT_TITLE = "NEFFI LAFT";
    private static final String REPORT_SUBTITLE = "Informe de Validacion en Listas Restrictivas";
    private static final float HEADER_TITLE_FONT_SIZE = 18f;
    private static final float HEADER_SUBTITLE_FONT_SIZE = 10.5f;
    private static final float HEADER_SUBTITLE_GAP = 19f;
    private static final float HEADER_BOTTOM_PADDING = 16f;

    private static final String[] TABLE_HEADERS = { "Documento", "Nombre", "Lista", "Coincidencia", "Fuente" };
    private static final float[] COL_WIDTHS = { 90, 140, 100, 80, 80 };
    private static final float ROW_HEIGHT = 18;
    private static final float TABLE_FONT_SIZE = 8f;
    private static final float TABLE_LINE_HEIGHT = 10f;
    private static final float CELL_HORIZONTAL_PADDING = 4f;
    private static final float CELL_TOP_PADDING = 8f;
    private static final float CELL_BOTTOM_PADDING = 4f;

    public byte[] generateValidationReport(String documentNumber, String personType,
            String fullName, String userName,
            List<RestrictiveListEntry> matches) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);

            ContentStreamHolder holder = new ContentStreamHolder(new PDPageContentStream(document, page));
            float y = page.getMediaBox().getHeight() - MARGIN;

            y = drawHeader(document, holder.cs, y);
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

        ContentStreamHolder(PDPageContentStream cs) {
            this.cs = cs;
        }
    }

    private float drawHeader(PDDocument document, PDPageContentStream cs, float y) throws IOException {
        float headerTopY = y + HEADER_TOP_RAISE;
        float logoTopY = headerTopY - LOGO_TOP_OFFSET;
        float logoBottomY = logoTopY - LOGO_HEIGHT;
        float logoCenterY = logoTopY - (LOGO_HEIGHT / 2f);
        float titleY = logoCenterY;
        float subtitleY = titleY - HEADER_SUBTITLE_GAP;

        drawLogo(document, cs, headerTopY);
        drawText(cs, REPORT_TITLE, PDType1Font.HELVETICA_BOLD, HEADER_TITLE_FONT_SIZE, HEADER_TEXT_X, titleY);
        drawText(cs, REPORT_SUBTITLE, PDType1Font.HELVETICA, HEADER_SUBTITLE_FONT_SIZE, HEADER_TEXT_X, subtitleY);

        float subtitleBottomY = subtitleY - HEADER_SUBTITLE_FONT_SIZE;

        return Math.min(logoBottomY, subtitleBottomY) - HEADER_BOTTOM_PADDING;
    }

    private void drawText(PDPageContentStream cs, String text, PDFont font, float fontSize, float x, float y)
            throws IOException {
        cs.beginText();
        cs.setFont(font, fontSize);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
    }

    private void drawLogo(PDDocument document, PDPageContentStream cs, float topY) throws IOException {
        PDImageXObject logoImage = createLogoImage(document);
        if (logoImage == null) {
            return;
        }

        float logoY = topY - LOGO_HEIGHT - LOGO_TOP_OFFSET;
        cs.drawImage(logoImage, HEADER_LOGO_X, logoY, LOGO_WIDTH, LOGO_HEIGHT);
    }

    private PDImageXObject createLogoImage(PDDocument document) {
        try (InputStream logoInput = getClass().getClassLoader().getResourceAsStream(LOGO_RESOURCE_PATH)) {
            if (logoInput == null) {
                log.warn("No se encontró el logo PNG en classpath: {}", LOGO_RESOURCE_PATH);
                return null;
            }

            return PDImageXObject.createFromByteArray(document, logoInput.readAllBytes(), "logo-af");
        } catch (IOException e) {
            log.warn("No se pudo cargar el logo para el reporte PDF", e);
            return null;
        }
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
        y = drawLabelValue(cs, y, "Numero de Documento:",
                sanitize(documentNumber != null ? documentNumber : "No proporcionado"));
        y = drawLabelValue(cs, y, "Nombre / Razon Social:",
                sanitize(fullName != null && !fullName.isBlank() ? fullName : "No proporcionado"));

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
        
        holder.cs.beginText();
        holder.cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
        holder.cs.newLineAtOffset(MARGIN, y);
        holder.cs.showText("Resultado de la Validacion");
        holder.cs.endText();
        y -= 20;

        if (validarCoincidencias(matches)) {
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

    private boolean validarCoincidencias(List<RestrictiveListEntry> matches) {
        if (matches == null || matches.isEmpty()) {
            return false;
        }
        for (RestrictiveListEntry match : matches) {
            if (!"0".equalsIgnoreCase(match.getCodigoLista().toString()) &&
                    match.getPermiteHomonimia() != null &&
                    match.getPermiteIdentificacion() != null &&
                    match.getTipo() != null &&
                    match.getTipoLista() != null) {
                return true;
            }
        }
        return false;
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
            String[] values = {
                sanitize(match.getIdentificacion()),
                sanitize(match.getSdnName()),
                sanitize(match.getNombre()),
                sanitize(match.getTipo()),
                sanitize(match.getComentarios2())
            };

            List<List<String>> wrappedValues = new ArrayList<>();
            int maxLines = 1;
            for (int i = 0; i < values.length; i++) {
            float maxTextWidth = COL_WIDTHS[i] - (CELL_HORIZONTAL_PADDING * 2);
            List<String> lines = wrapText(values[i], maxTextWidth, PDType1Font.HELVETICA, TABLE_FONT_SIZE);
            wrappedValues.add(lines);
            maxLines = Math.max(maxLines, lines.size());
            }

            float rowHeight = Math.max(ROW_HEIGHT,
                CELL_TOP_PADDING + CELL_BOTTOM_PADDING + ((maxLines - 1) * TABLE_LINE_HEIGHT));

            if (y - rowHeight < MARGIN + 20) {
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
            for (int i = 0; i < wrappedValues.size(); i++) {
                List<String> lines = wrappedValues.get(i);
                for (int lineIndex = 0; lineIndex < lines.size(); lineIndex++) {
                    holder.cs.beginText();
                    holder.cs.setFont(PDType1Font.HELVETICA, TABLE_FONT_SIZE);
                    holder.cs.newLineAtOffset(x + CELL_HORIZONTAL_PADDING,
                            y - CELL_TOP_PADDING - (lineIndex * TABLE_LINE_HEIGHT));
                    holder.cs.showText(lines.get(lineIndex));
                    holder.cs.endText();
                }
                x += COL_WIDTHS[i];
            }
            y -= rowHeight;
        }

        return y;
    }

    private List<String> wrapText(String text, float maxWidth, PDFont font, float fontSize) throws IOException {
        List<String> lines = new ArrayList<>();
        String sanitized = sanitize(text);

        if (sanitized.isBlank()) {
            lines.add("");
            return lines;
        }

        String[] paragraphs = sanitized.split("\\R");
        for (String paragraph : paragraphs) {
            String trimmed = paragraph.trim();
            if (trimmed.isEmpty()) {
                lines.add("");
                continue;
            }

            String currentLine = "";
            String[] words = trimmed.split("\\s+");

            for (String word : words) {
                String candidate = currentLine.isEmpty() ? word : currentLine + " " + word;
                if (getTextWidth(candidate, font, fontSize) <= maxWidth) {
                    currentLine = candidate;
                    continue;
                }

                if (!currentLine.isEmpty()) {
                    lines.add(currentLine);
                    currentLine = "";
                }

                if (getTextWidth(word, font, fontSize) <= maxWidth) {
                    currentLine = word;
                    continue;
                }

                List<String> chunks = splitLongWord(word, maxWidth, font, fontSize);
                if (chunks.size() > 1) {
                    lines.addAll(chunks.subList(0, chunks.size() - 1));
                }
                currentLine = chunks.get(chunks.size() - 1);
            }

            if (!currentLine.isEmpty()) {
                lines.add(currentLine);
            }
        }

        if (lines.isEmpty()) {
            lines.add("");
        }

        return lines;
    }

    private List<String> splitLongWord(String word, float maxWidth, PDFont font, float fontSize) throws IOException {
        List<String> chunks = new ArrayList<>();
        StringBuilder chunk = new StringBuilder();

        for (int i = 0; i < word.length(); i++) {
            String candidate = chunk.toString() + word.charAt(i);
            if (!chunk.isEmpty() && getTextWidth(candidate, font, fontSize) > maxWidth) {
                chunks.add(chunk.toString());
                chunk = new StringBuilder().append(word.charAt(i));
            } else {
                chunk.append(word.charAt(i));
            }
        }

        if (!chunk.isEmpty()) {
            chunks.add(chunk.toString());
        }

        if (chunks.isEmpty()) {
            chunks.add("");
        }

        return chunks;
    }

    private float getTextWidth(String text, PDFont font, float fontSize) throws IOException {
        if (text == null || text.isEmpty()) {
            return 0f;
        }
        return (font.getStringWidth(text) / 1000f) * fontSize;
    }

    private String sanitize(String text) {
        if (text == null)
            return "";
        return text.replaceAll("[\\p{Cntrl}&&[^\t]]", "").replace("\t", " ");
    }
}
