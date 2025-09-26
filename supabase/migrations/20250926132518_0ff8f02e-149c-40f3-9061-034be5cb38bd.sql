-- Criar tabela de apoios
CREATE TABLE public.apoios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  meta_valor INTEGER NOT NULL, -- Valor em centavos
  valor_atual INTEGER NOT NULL DEFAULT 0, -- Valor em centavos
  imagem_url TEXT,
  user_id TEXT NOT NULL, -- ID do usuário do InfinitePay
  handle_infinitepay TEXT NOT NULL, -- Handle para receber pagamentos
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de apoiadores
CREATE TABLE public.apoiadores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apoio_id UUID NOT NULL REFERENCES public.apoios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  valor INTEGER NOT NULL, -- Valor em centavos
  transaction_nsu TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.apoios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apoiadores ENABLE ROW LEVEL SECURITY;

-- Políticas para apoios
CREATE POLICY "Apoios são visíveis para todos" 
ON public.apoios 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem criar seus próprios apoios" 
ON public.apoios 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar seus próprios apoios" 
ON public.apoios 
FOR UPDATE 
USING (true);

-- Políticas para apoiadores
CREATE POLICY "Apoiadores são visíveis para todos" 
ON public.apoiadores 
FOR SELECT 
USING (true);

CREATE POLICY "Qualquer um pode adicionar apoio" 
ON public.apoiadores 
FOR INSERT 
WITH CHECK (true);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para apoios
CREATE TRIGGER update_apoios_updated_at
BEFORE UPDATE ON public.apoios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar valor atual do apoio
CREATE OR REPLACE FUNCTION public.update_apoio_valor()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para atualizar valor quando apoiador é adicionado
CREATE TRIGGER update_valor_apoio
AFTER INSERT ON public.apoiadores
FOR EACH ROW
EXECUTE FUNCTION public.update_apoio_valor();