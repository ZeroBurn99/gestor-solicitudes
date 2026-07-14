"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Solicitud {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  userEmail: string;
}

export default function SolicitudesPage() {

  const router = useRouter();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Crear
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("soporte");


  // Editar
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editTipo, setEditTipo] = useState("soporte");



  const cargarSolicitudes = async () => {

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;


    if (!token) {
      router.push("/login");
      return;
    }


    try {

      const res = await fetch("/api/solicitudes", {
        method:"GET",
        headers:{
          Authorization:`Bearer ${token}`,
          role:user?.role || "",
          userid:user?.id || ""
        }
      });


      const data = await res.json();


      if(!res.ok){
        throw new Error(data.message);
      }


      setSolicitudes(data.solicitudes || []);


    } catch(error){

      console.error(error);
      setError("No se pudieron cargar las solicitudes");

    } finally {

      setLoading(false);

    }

  };



  useEffect(()=>{

    cargarSolicitudes();

  },[]);





  const crearSolicitud = async()=>{

    setError("");
    setMensaje("");

    const token = localStorage.getItem("token");

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;


    if(!titulo || !descripcion){

      setError("Título y descripción son obligatorios");
      return;

    }


    try{


      const res = await fetch("/api/solicitudes",{

        method:"POST",

        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          titulo,
          descripcion,
          tipo,
          userId:user.id,
          userEmail:user.email

        })

      });


      const data = await res.json();


      if(!res.ok){

        setError(data.message);
        return;

      }


      setMensaje("Solicitud creada correctamente");

      setTitulo("");
      setDescripcion("");
      setTipo("soporte");

      cargarSolicitudes();


    }catch(error){

      console.error(error);
      setError("Error al crear solicitud");

    }

  };






  const iniciarEdicion = (s:Solicitud)=>{

    setEditandoId(s.id);
    setEditTitulo(s.titulo);
    setEditDescripcion(s.descripcion);
    setEditTipo(s.tipo);

  };







  const guardarEdicion = async(id:string)=>{

    const token = localStorage.getItem("token");


    try{


      const res = await fetch("/api/solicitudes",{

        method:"PUT",

        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"application/json"
        },


        body:JSON.stringify({

          id,
          titulo:editTitulo,
          descripcion:editDescripcion,
          tipo:editTipo

        })

      });



      const data = await res.json();



      if(!res.ok){

        setError(data.message);
        return;

      }



      setMensaje("Solicitud actualizada correctamente");

      setEditandoId(null);

      cargarSolicitudes();



    }catch(error){

      console.error(error);
      setError("Error al actualizar");

    }

  };






  const eliminarSolicitud = async(id:string)=>{

    const token = localStorage.getItem("token");


    try{


      const res = await fetch("/api/solicitudes",{

        method:"DELETE",

        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"application/json"
        },


        body:JSON.stringify({
          id
        })

      });



      const data = await res.json();



      if(!res.ok){

        setError(data.message);
        return;

      }



      setMensaje("Solicitud eliminada");

      cargarSolicitudes();



    }catch(error){

      console.error(error);
      setError("Error al eliminar");

    }

  };







  const cerrarSesion = ()=>{

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");

  };







  if(loading){

    return <p className="p-5">Cargando solicitudes...</p>;

  }







  return (

    <div className="p-8 bg-gray-900 min-h-screen text-white">


      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Listado de Solicitudes
        </h1>


        <button
          onClick={cerrarSesion}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>

      </div>





      {mensaje && (

        <p className="text-green-400 mb-4">
          {mensaje}
        </p>

      )}




      {error && (

        <p className="text-red-400 mb-4">
          {error}
        </p>

      )}






      <div className="bg-gray-800 p-6 rounded-lg mb-8">


        <h2 className="text-xl mb-4">
          Nueva solicitud
        </h2>



        <input

          className="w-full p-3 mb-3 bg-gray-700 rounded"

          placeholder="Título"

          value={titulo}

          onChange={(e)=>setTitulo(e.target.value)}

        />



        <textarea

          className="w-full p-3 mb-3 bg-gray-700 rounded"

          placeholder="Descripción"

          value={descripcion}

          onChange={(e)=>setDescripcion(e.target.value)}

        />



        <select

          className="w-full p-3 mb-3 bg-gray-700 rounded"

          value={tipo}

          onChange={(e)=>setTipo(e.target.value)}

        >

          <option value="soporte">
            Soporte
          </option>

          <option value="permiso">
            Permiso
          </option>

          <option value="requerimiento">
            Requerimiento
          </option>

        </select>



        <button

          onClick={crearSolicitud}

          className="bg-blue-600 px-5 py-2 rounded"

        >

          Crear solicitud

        </button>


      </div>







      {solicitudes.map((s)=>(


        <div 
          key={s.id}
          className="bg-gray-800 p-5 rounded mb-4"
        >



          {editandoId === s.id ? (


            <>


              <input

                className="w-full p-2 bg-gray-700 mb-2"

                value={editTitulo}

                onChange={(e)=>setEditTitulo(e.target.value)}

              />



              <textarea

                className="w-full p-2 bg-gray-700 mb-2"

                value={editDescripcion}

                onChange={(e)=>setEditDescripcion(e.target.value)}

              />



              <select

                className="w-full p-2 bg-gray-700 mb-3"

                value={editTipo}

                onChange={(e)=>setEditTipo(e.target.value)}

              >

                <option value="soporte">
                  Soporte
                </option>

                <option value="permiso">
                  Permiso
                </option>

                <option value="requerimiento">
                  Requerimiento
                </option>

              </select>




              <button

                onClick={()=>guardarEdicion(s.id)}

                className="bg-green-600 px-4 py-2 rounded mr-2"

              >
                Guardar
              </button>



              <button

                onClick={()=>setEditandoId(null)}

                className="bg-gray-600 px-4 py-2 rounded"

              >
                Cancelar
              </button>


            </>



          ) : (


            <>


              <h2 className="text-xl font-bold">
                {s.titulo}
              </h2>


              <p>
                {s.descripcion}
              </p>


              <p className="text-blue-400">

                Tipo: {s.tipo} | Estado: {s.estado}

              </p>




              <button

                onClick={()=>iniciarEdicion(s)}

                className="bg-yellow-600 px-4 py-2 rounded mt-3 mr-2"

              >
                Editar
              </button>




              <button

                onClick={()=>eliminarSolicitud(s.id)}

                className="bg-red-600 px-4 py-2 rounded mt-3"

              >
                Eliminar
              </button>



            </>


          )}



        </div>


      ))}



    </div>

  );

}