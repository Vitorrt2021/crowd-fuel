-- Corrigir funções com search_path adequado para segurança

-- Atualizar função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Atualizar função update_apoio_valor
CREATE OR REPLACE FUNCTION public.update_apoio_valor()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  UPDATE public.apoios 
  SET valor_atual = (
    SELECT COALESCE(SUM(valor), 0) 
    FROM public.apoiadores 
    WHERE apoio_id = NEW.apoio_id
  )
  WHERE id = NEW.apoio_id;
  
  RETURN NEW;
END;
$$;