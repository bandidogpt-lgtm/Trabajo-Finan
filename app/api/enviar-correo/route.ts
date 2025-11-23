import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { emailDestino, pdfBase64 } = await req.json();

    if (!emailDestino || !pdfBase64) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const response = await resend.emails.send({
      from: "Simulador Financiero <reportes@resend.dev>",
      to: emailDestino,
      subject: "Informe de Crédito",
      html: `
        <p>Estimado cliente,</p>
        <p>Adjuntamos el informe de su simulación de crédito.</p>
      `,
      attachments: [
        {
          filename: "Informe_Credito.pdf",
          content: pdfBase64,
        },
      ],
    });

    return NextResponse.json({ ok: true, response });
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    return NextResponse.json(
      { error: "Error enviando correo" },
      { status: 500 }
    );
  }
}
