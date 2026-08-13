package com.example.midas_api.exception;

import com.example.midas_api.exception.dto.ErrorResponse;
import com.example.midas_api.exception.dto.ErrorResponse.CampoErro;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;

/**
 * Handler global de exceções da API. Toda exceção lançada em qualquer
 * Controller (ou Service, propagando pra cima) passa por aqui e é
 * convertida numa resposta {@link ErrorResponse} consistente.
 *
 * Estende {@link ResponseEntityExceptionHandler} pra reaproveitar/sobrescrever
 * o tratamento padrão do Spring para exceções internas do MVC (ex: erro de
 * parsing do JSON, validação de @RequestBody, etc.), mantendo o mesmo
 * formato de corpo de resposta em todos os casos.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    // ---------------------------------------------------------------
    // Exceções de negócio (definidas por nós)
    // ---------------------------------------------------------------

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        return montarResposta(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleResourceAlreadyExists(
            ResourceAlreadyExistsException ex, WebRequest request) {
        return montarResposta(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex, WebRequest request) {
        return montarResposta(ex.getStatus(), ex.getMessage(), request);
    }

    // ---------------------------------------------------------------
    // Validação de @RequestParam / @PathVariable com @Validated
    // (diferente de @Valid em @RequestBody, que é tratado abaixo)
    // ---------------------------------------------------------------

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, WebRequest request) {
        List<CampoErro> erros = ex.getConstraintViolations().stream()
                .map(this::toCampoErro)
                .toList();

        ErrorResponse body = ErrorResponse.ofValidacao(
                HttpStatus.BAD_REQUEST,
                "Parâmetro(s) inválido(s)",
                path(request),
                erros
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    private CampoErro toCampoErro(ConstraintViolation<?> violation) {
        String caminho = violation.getPropertyPath().toString();
        // pega só o último segmento do path (ex: "buscarPorId.id" -> "id")
        String campo = caminho.contains(".")
                ? caminho.substring(caminho.lastIndexOf('.') + 1)
                : caminho;
        return new CampoErro(campo, violation.getMessage());
    }

    // ---------------------------------------------------------------
    // Violação de integridade no banco (unique constraint, FK, etc.)
    // Última linha de defesa — idealmente a regra já foi barrada antes,
    // no Service, via ResourceAlreadyExistsException / BusinessException.
    // ---------------------------------------------------------------

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {
        return montarResposta(
                HttpStatus.CONFLICT,
                "A operação viola uma restrição de integridade dos dados (ex: valor duplicado ou vínculo obrigatório ausente).",
                request
        );
    }

    // ---------------------------------------------------------------
    // Fallback genérico — qualquer exceção não mapeada explicitamente.
    // Nunca expõe a mensagem/stack trace originais ao cliente.
    // ---------------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, WebRequest request) {
        logger.error("Erro não tratado: ", ex);
        return montarResposta(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                request
        );
    }

    // ---------------------------------------------------------------
    // Sobrescritas do ResponseEntityExceptionHandler
    // (exceções internas que o próprio Spring MVC lança)
    // ---------------------------------------------------------------

    /** @Valid em @RequestBody que falhou (DTOs de Request com Bean Validation). */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {

        List<CampoErro> erros = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toCampoErro)
                .toList();

        ErrorResponse body = ErrorResponse.ofValidacao(
                HttpStatus.BAD_REQUEST,
                "Erro de validação nos campos enviados",
                path(request),
                erros
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    private CampoErro toCampoErro(FieldError fieldError) {
        return new CampoErro(fieldError.getField(), fieldError.getDefaultMessage());
    }

    /** Corpo da requisição ausente, JSON malformado, ou enum/tipo inválido no corpo. */
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        ErrorResponse body = ErrorResponse.of(
                HttpStatus.BAD_REQUEST,
                "Corpo da requisição ausente ou em formato inválido.",
                path(request)
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /** Parâmetro obrigatório (@RequestParam) não enviado na requisição. */
    @Override
    protected ResponseEntity<Object> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        ErrorResponse body = ErrorResponse.of(
                HttpStatus.BAD_REQUEST,
                "Parâmetro obrigatório ausente: " + ex.getParameterName(),
                path(request)
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // ---------------------------------------------------------------
    // Tipo de parâmetro incompatível (ex: /leiloes/abc -> id deveria ser Integer)
    // ---------------------------------------------------------------

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, WebRequest request) {
        String tipoEsperado = ex.getRequiredType() != null
                ? ex.getRequiredType().getSimpleName()
                : "outro tipo";
        String mensagem = "O parâmetro '%s' deveria ser do tipo %s, mas recebeu: '%s'"
                .formatted(ex.getName(), tipoEsperado, ex.getValue());
        return montarResposta(HttpStatus.BAD_REQUEST, mensagem, request);
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private ResponseEntity<ErrorResponse> montarResposta(
            HttpStatus status, String mensagem, WebRequest request) {
        ErrorResponse body = ErrorResponse.of(status, mensagem, path(request));
        return ResponseEntity.status(status).body(body);
    }

    private String path(WebRequest request) {
        // WebRequest#getDescription(false) devolve algo como "uri=/api/v1/leiloes/5"
        String descricao = request.getDescription(false);
        return descricao.replace("uri=", "");
    }
}