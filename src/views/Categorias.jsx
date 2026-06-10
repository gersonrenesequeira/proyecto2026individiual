import React, { useState, useEffect } from "react";
// Importamos Container aquí
import { Row, Col, Button, Spinner, Container } from "react-bootstrap";
import { supabase } from "../database/supabaseconfi";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCategorias from "../components/categorias/TablaCategorias";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import TarjetaCategoria from "../components/categorias/TarjetaCategoria";

const Categorias = () => {
    // ... (todo tu estado y funciones se mantienen exactamente igual)
    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre_categoria: "",
        descripcion_categoria: "",
    });
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [categoriaEditar, setCategoriaEditar] = useState({
        id_categoria: "",
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setCategoriaEditar((prev) => ({ ...prev, [name]: value }));
    };

    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria((prev) => ({ ...prev, [name]: value }));
    };

    const abrirModalEdicion = (categoria) => {
        setCategoriaEditar({
            id_categoria: categoria.id_categoria,
            nombre_categoria: categoria.nombre_categoria,
            descripcion_categoria: categoria.descripcion_categoria,
        });
        setMostrarModalEdicion(true);
    };

    const abrirModalEliminacion = (categoria) => {
        setCategoriaAEliminar(categoria);
        setMostrarModalEliminacion(true);
    };

    const cargarCategorias = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_categoria", { ascending: true });

            if (error) throw error;
            setCategorias(data || []);
        } catch (err) {
            console.error("Error:", err.message);
            setToast({ mostrar: true, mensaje: "Error al cargar categorías.", tipo: "error" });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    const agregarCategoria = async () => {
        if (!nuevaCategoria.nombre_categoria.trim() || !nuevaCategoria.descripcion_categoria.trim()) {
            setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
            return;
        }
        try {
            const { error } = await supabase.from("categorias").insert([nuevaCategoria]);
            if (error) throw error;
            setToast({ mostrar: true, mensaje: "Categoría registrada exitosamente.", tipo: "exito" });
            setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
            setMostrarModal(false);
            cargarCategorias();
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al registrar categoría.", tipo: "error" });
        }
    };

    const actualizarCategoria = async () => {
        try {
            const { error } = await supabase
                .from("categorias")
                .update({
                    nombre_categoria: categoriaEditar.nombre_categoria,
                    descripcion_categoria: categoriaEditar.descripcion_categoria,
                })
                .eq("id_categoria", categoriaEditar.id_categoria);

            if (error) throw error;
            setMostrarModalEdicion(false);
            cargarCategorias();
            setToast({ mostrar: true, mensaje: "Categoría actualizada exitosamente.", tipo: "exito" });
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al actualizar categoría.", tipo: "error" });
        }
    };

    const eliminarCategoria = async () => {
        try {
            const { error } = await supabase
                .from("categorias")
                .delete()
                .eq("id_categoria", categoriaAEliminar.id_categoria);

            if (error) throw error;
            setMostrarModalEliminacion(false);
            cargarCategorias();
            setToast({ mostrar: true, mensaje: "Categoría eliminada exitosamente.", tipo: "exito" });
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al eliminar categoría.", tipo: "error" });
        }
    };

    return (
        <Container mt-3 className="mt-3"> 
            <Row className="align-items-center mb-3">
                <Col xs={9} sm={7}>
                    <h3 className="mb-0"><i className="bi-bookmark-plus-fill me-2"></i> Categorías</h3>
                </Col>
                <Col xs={3} sm={5} className="text-end">
                    <Button onClick={() => setMostrarModal(true)}>
                        <i className="bi-plus-lg"></i>
                        <span className="d-none d-sm-inline ms-2">Nueva Categoría</span>
                    </Button>
                </Col>
            </Row>

            <hr />

            {cargando ? (
                <Row className="text-center my-5">
                    <Col>
                        <Spinner animation="border" variant="success" />
                        <p className="mt-3 text-muted">Cargando categorías...</p>
                    </Col>
                </Row>
            ) : (
                <Row>
                    <Col lg={12} className="d-none d-lg-block">
                        <TablaCategorias 
                            categorias={categorias} 
                            abrirModalEdicion={abrirModalEdicion} 
                            abrirModalEliminacion={abrirModalEliminacion} 
                        />
                    </Col>
                    <Col xs={12} className="d-lg-none">
                        <TarjetaCategoria 
                            categorias={categorias} 
                            abrirModalEdicion={abrirModalEdicion} 
                            abrirModalEliminacion={abrirModalEliminacion} 
                        />
                    </Col>
                </Row>
            )}

            <ModalRegistroCategoria 
                mostrarModal={mostrarModal} setMostrarModal={setMostrarModal} 
                nuevaCategoria={nuevaCategoria} manejoCambioInput={manejoCambioInput} 
                agregarCategoria={agregarCategoria} 
            />
            <ModalEdicionCategoria 
                mostrarModalEdicion={mostrarModalEdicion} setMostrarModalEdicion={setMostrarModalEdicion} 
                categorLaEditar={categoriaEditar} manejoCambioInputEdicion={manejoCambioInputEdicion} 
                actualizarCategoria={actualizarCategoria} 
            />
            <ModalEliminacionCategoria 
                mostrarModalEliminacion={mostrarModalEliminacion} setMostrarModalEliminacion={setMostrarModalEliminacion} 
                eliminarCategoria={eliminarCategoria} categoria={categoriaAEliminar} 
            />
            <NotificacionOperacion 
                mostrar={toast.mostrar} mensaje={toast.mensaje} tipo={toast.tipo} 
                onCerrar={() => setToast({ ...toast, mostrar: false })} 
            />
        </Container>
    );
};

export default Categorias;