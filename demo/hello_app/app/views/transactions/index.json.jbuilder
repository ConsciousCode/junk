json.array!(@transactions) do |transaction|
  json.extract! transaction, :id, :user_from, :user_to, :amount
  json.url transaction_url(transaction, format: :json)
end
