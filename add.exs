defmodule Adder do
  def sum(a,b) do
    a + b
  end
end

IO.puts "sum(1,2): #{sum(1,2)}";
IO.puts "sum(1,(2,3)): #{sum(1,(2,3))}";
IO.puts "sum((1,2)): #{sum((1,2))}";
