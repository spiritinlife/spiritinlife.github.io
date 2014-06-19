---
layout: post
title:  "Simple timing a proccess in C."
date:   2014-06-19 04:30:00
categories: c
---


The code below showcases:

1) Pointers to functions in c

2) Timing a proccess. It uses time.h.

The code bellow is not fully tested and it can be improven.
Furthermore it would be nice to have an OOP like style  and i am planning to add that in the future.

Some notes about time.h ,clock_t and clock().
As stated here http://www.cplusplus.com/reference/ctime/clock/.
clock() returns the processor time consumed by the program.
The value returned is expressed in clock ticks, which are units of time of a constant but system-specific length (with a relation of CLOCKS_PER_SEC clock ticks per second).

Ok so lets start with the header file

For this example i will be timing a bubble sort algorithm.
The function that does the sorting takes an array and the array size.

{% highlight c %}
#include <time.h>
#include <stdio.h>
//This struct will hold the start and end time of a proccess
//We will use this info to Calculate the amount of seconds the proccess consumed
typedef struct TimeAProccess
{
  clock_t start;
  clock_t end;
}TimeAProccess;

//This will be used to initialize the clock_t start 
void startTime(TimeAProccess *this);

//This will be used to initialize the clock_t end 
void endTime(TimeAProccess *this);

//This will display the results
void elapsedTimeCPU(TimeAProccess *this);

//This is where the magic happens 
//It defines a function which gets as its first argument a function pointer .
//The other arguments are the arguments for the function to call
//In this case my function is prototyped to take an array and the array size.
//Depending on what you implement this whould change
void startTimedProccess(void (*funcProccess)(int*,int),int* array,int arraySize);

{% endhighlight %}


Now the implementation of the header file/

{% highlight c %}
//we include our header file
#include "myTimeProccessHeaderFileDefinedAbove.h"

//Here starts the implementation
void startTime(TimeAProccess *this){
	this->start = clock();
};
void endTime(TimeAProccess *this) {
	this->end = clock();
};
void elapsedTimeCPU(TimeAProccess *this) {
	clock_t diff;
	int msec;
	diff = this->end - this->start;
	msec = diff * 1000 / CLOCKS_PER_SEC;
	printf("Time taken for this proccess to execute %ds:%dms\n", msec / 1000, msec % 1000);
}

void startTimedProccess(void(*funcProccess)(int*, int), int* array, int arraySize){
	TimeAProccess pSortTime;   //create the struct that holds our data
	printf("Proccess starts..\n");
	startTime(&pSortTime);     //initialize start time
	funcProccess(array, arraySize);    //start bubble sort or any other proccess
	endTime(&pSortTime);       //initialize end time
	printf("Proccess ends..\n");
	elapsedTimeCPU(&pSortTime);   //display results
}


{% endhighlight %}

Now for the main program.

{% highlight c %}
//we include our header file
#include "myTimeProccessHeaderFileDefinedAbove.h"
//First here is the bubble Sort
//This is the proccess we want to time
void bubbleSort(int* array, int size){
	int swapped;
	int i;
	do{
		swapped = 0;
		for (i = 1; i <= size - 1; i++){
			if (array[i - 1] > array[i]){
				int temp = array[i - 1];
				array[i - 1] = array[i];
				array[i] = temp;
				swapped = 1;
			}
		}
		n = n - 1;
	} while (swapped == 1);
}

int main(){
	
int array[50];
int i;
for(i =0; i<50; i++){
   array[i] = 50-i;
}

//Give the bubble sort function adress to the startTimedProccess func
startTimedProccess(&bubbleSort,array,50);

return 0;
}
{% endhighlight %}


