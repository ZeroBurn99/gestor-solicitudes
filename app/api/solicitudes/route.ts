import { NextResponse } from "next/server";
import { getSolicitudesCollection } from "@/lib/database";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      titulo,
      descripcion,
      tipo,
      userId,
      userEmail,
    } = body;

    if (!titulo || !descripcion || !tipo || !userId || !userEmail) {
      return NextResponse.json(
        { message: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const nuevaSolicitud = {
      id: Date.now().toString(),
      userId,
      userEmail,
      titulo,
      descripcion,
      tipo,
      estado: "abierta",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const solicitudesDB = await getSolicitudesCollection();

    solicitudesDB.insert(nuevaSolicitud);

    return NextResponse.json(
      {
        message: "Solicitud creada correctamente",
        solicitud: nuevaSolicitud,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("ERROR POST:", error);

    return NextResponse.json(
      {
        message: "Error al crear solicitud",
      },
      { status: 500 }
    );
  }
}


export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const role = req.headers.get("role");
    const userId = req.headers.get("userid");

    if (!authHeader) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    if (!role || !userId) {
      return NextResponse.json(
        { message: "Información incompleta" },
        { status: 400 }
      );
    }


    const solicitudesDB = await getSolicitudesCollection();

    if (role === "admin") {

      return NextResponse.json(
        {
          solicitudes: solicitudesDB.find(),
        },
        { status: 200 }
      );

    }


    return NextResponse.json(
      {
        solicitudes: solicitudesDB.find({ userId }),
      },
      { status: 200 }
    );


  } catch (error) {

    console.error("ERROR GET:", error);

    return NextResponse.json(
      {
        message: "Error al obtener solicitudes",
      },
      { status: 500 }
    );
  }
}



export async function PUT(req: Request) {

  try {

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }


    const body = await req.json();

    const {
      id,
      titulo,
      descripcion,
      tipo,
    } = body;


    if (!id || !titulo || !descripcion || !tipo) {

      return NextResponse.json(
        {
          message: "Datos incompletos",
        },
        { status: 400 }
      );

    }


    const solicitudesDB = await getSolicitudesCollection();


    const solicitud = solicitudesDB.findOne({
      id,
    });


    if (!solicitud) {

      return NextResponse.json(
        {
          message: "Solicitud no encontrada",
        },
        { status: 404 }
      );

    }


    solicitud.titulo = titulo;
    solicitud.descripcion = descripcion;
    solicitud.tipo = tipo;
    solicitud.updatedAt = new Date().toISOString();


    solicitudesDB.update(solicitud);


    return NextResponse.json(
      {
        message: "Solicitud actualizada",
        solicitud,
      },
      { status: 200 }
    );


  } catch(error){

    console.error("ERROR PUT:", error);

    return NextResponse.json(
      {
        message:"Error al actualizar solicitud"
      },
      {
        status:500
      }
    );

  }

}




export async function DELETE(req: Request){

  try{

    const authHeader = req.headers.get("authorization");


    if(!authHeader){

      return NextResponse.json(
        {
          message:"No autorizado"
        },
        {
          status:401
        }
      );

    }


    const body = await req.json();

    const { id } = body;


    const solicitudesDB = await getSolicitudesCollection();


    const solicitud = solicitudesDB.findOne({
      id
    });


    if(!solicitud){

      return NextResponse.json(
        {
          message:"Solicitud no encontrada"
        },
        {
          status:404
        }
      );

    }


    solicitudesDB.remove(solicitud);



    return NextResponse.json(
      {
        message:"Solicitud eliminada"
      },
      {
        status:200
      }
    );



  }catch(error){

    console.error("ERROR DELETE:",error);


    return NextResponse.json(
      {
        message:"Error al eliminar solicitud"
      },
      {
        status:500
      }
    );

  }

}