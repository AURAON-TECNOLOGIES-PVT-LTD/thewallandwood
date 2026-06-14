import { supabase } from '@/lib/supabaseClient'

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, stock')
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data
}

export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}