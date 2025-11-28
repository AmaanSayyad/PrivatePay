import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

// Database Tables:
// 1. users: id, wallet_address, username, created_at
// 2. payments: id, sender_address, recipient_username, amount, tx_hash, status, created_at
// 3. balances: id, username, wallet_address, available_balance, created_at, updated_at
// 4. payment_links: id, wallet_address, username, alias, created_at

/**
 * Register or get user
 */
export async function registerUser(walletAddress, username) {
  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingUser) {
      // Update username if changed
      if (existingUser.username !== username) {
        const { data, error } = await supabase
          .from('users')
          .update({ username })
          .eq('wallet_address', walletAddress)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      return existingUser;
    }

    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert([{ wallet_address: walletAddress, username }])
      .select()
      .single();

    if (error) throw error;

    // Initialize balance
    await supabase
      .from('balances')
      .insert([{ 
        username, 
        wallet_address: walletAddress, 
        available_balance: 0 
      }]);

    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * Record incoming payment
 */
export async function recordPayment(senderAddress, recipientUsername, amount, txHash) {
  try {
    // Record payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        sender_address: senderAddress,
        recipient_username: recipientUsername,
        amount: parseFloat(amount),
        tx_hash: txHash,
        status: 'completed'
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update balance
    const { data: balance, error: balanceError } = await supabase
      .from('balances')
      .select('available_balance')
      .eq('username', recipientUsername)
      .single();

    if (balanceError) throw balanceError;

    const newBalance = (balance?.available_balance || 0) + parseFloat(amount);

    await supabase
      .from('balances')
      .update({ 
        available_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('username', recipientUsername);

    return payment;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
}

/**
 * Get user balance
 */
export async function getUserBalance(username) {
  try {
    const { data, error } = await supabase
      .from('balances')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting balance:', error);
    return { available_balance: 0 };
  }
}

/**
 * Get user payments (received)
 */
export async function getUserPayments(username) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('recipient_username', username)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting payments:', error);
    return [];
  }
}

/**
 * Withdraw funds
 */
export async function withdrawFunds(username, amount, destinationAddress, txHash) {
  try {
    // Get current balance
    const { data: balance } = await supabase
      .from('balances')
      .select('available_balance')
      .eq('username', username)
      .single();

    if (!balance || balance.available_balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Record withdrawal
    await supabase
      .from('payments')
      .insert([{
        sender_address: 'treasury',
        recipient_username: username,
        amount: -parseFloat(amount),
        tx_hash: txHash,
        status: 'withdrawn'
      }]);

    // Update balance
    const newBalance = balance.available_balance - parseFloat(amount);
    await supabase
      .from('balances')
      .update({ 
        available_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('username', username);

    return { success: true, newBalance };
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    throw error;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Create payment link
 */
export async function createPaymentLink(walletAddress, username, alias) {
  try {
    const { data, error } = await supabase
      .from('payment_links')
      .insert([{
        wallet_address: walletAddress,
        username,
        alias
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw error;
  }
}

/**
 * Get payment links by wallet address
 */
export async function getPaymentLinks(walletAddress) {
  try {
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting payment links:', error);
    return [];
  }
}

/**
 * Get payment link by alias
 */
export async function getPaymentLinkByAlias(alias) {
  try {
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('alias', alias)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting payment link:', error);
    return null;
  }
}
