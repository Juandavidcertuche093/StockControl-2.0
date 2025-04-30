export interface Medicamento {
  idMedicamento:        number;
  nombre:               string;
  idCategoria:          number;
  descripcionCategoria: string;
  idProveedor:          number;
  nombreProveedor:      string;
  idImagen:             number;
  nombreImagen:         string;
  rutaImagen:           string;
  stock:                number;
  fechaVencimiento?:    string,
  esActivo:             number;
}
