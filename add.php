<?php
function sum($a, $b) 
{ 
    return $a + $b; 
}

echo "sum(1,2): " . sum(1,2);
echo "sum(1,(2,3)): " . sum(1,(2,3));
echo "sum((1,2)): " . sum((1,2));
